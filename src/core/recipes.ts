// src/core/recipes.ts
//
// 配方注册表：从 data/recipes.json 加载结构化配方数据，提供类型安全的查询入口。
// UI 和 stats 计算都通过本模块获取配方 inputs/outputs/powerMW，严禁回到 machine.recipe
// 字符串这种自由格式。
//
// 设计约束：
// - RecipeId 是 recipes.json 中所有 recipe.id 的联合类型（运行时从数据推导）
// - Machine.recipe 字段应填 RecipeId，不再是自由字符串
// - 未知 id 由 schema 校验层捕获（R18），本模块只做数据装载
//
import recipesData from '../../data/recipes.json';
import type { PlaceableType } from './types';

// ============================================================
// 类型定义
// ============================================================

/** 传送带等级 → 标称吞吐（items/min） */
export type BeltMarkKey = 'mk1' | 'mk2' | 'mk3' | 'mk4' | 'mk5' | 'mk6';

export interface RecipePort {
  item: string;
  amount: number;
  rate: number;
}

/** 配方所属的生产机器类型（与 BUILDING_REGISTRY key 对齐） */
export type RecipeMachine = PlaceableType | 'nuclear-power-plant' | 'water-extractor' | 'oil-extractor' | 'miner';

export interface Recipe {
  id: string;
  name: string;
  nameEn: string;
  machine: RecipeMachine;
  cycleTime: number;
  powerMW: number;
  inputs: RecipePort[];
  outputs: RecipePort[];
}

// ============================================================
// 运行时注册表：按 id 建索引
// ============================================================

const rawRecipes = (recipesData as { recipes: Recipe[] }).recipes;

export const RECIPE_REGISTRY: Record<string, Recipe> = Object.fromEntries(
  rawRecipes.map(r => [r.id, r]),
);

export const BELT_RATES: Record<BeltMarkKey, number> =
  (recipesData as { beltRates: Record<BeltMarkKey, number> }).beltRates;

// ============================================================
// 查询辅助
// ============================================================

/** 按 id 查配方；未知 id 返回 undefined，让调用方决定报错还是忽略 */
export function getRecipe(id: string | undefined): Recipe | undefined {
  if (!id) return undefined;
  return RECIPE_REGISTRY[id];
}

/** 按 machine 类型列出所有匹配配方（用于 UI 下拉选项等场景） */
export function getRecipesByMachine(machine: RecipeMachine): Recipe[] {
  return rawRecipes.filter(r => r.machine === machine);
}

/**
 * 给定配方 + 时钟速率（百分比，默认 100），返回每分钟输入/输出/功耗。
 *
 * 注意：此函数只算单台机器"设计速率"，不考虑上下游瓶颈。
 * 整厂的 supply/demand 平衡由 computeStats.ts 聚合。
 */
export function computeMachineFlow(
  recipeId: string | undefined,
  clockSpeed: number | undefined = 100,
): { inputs: RecipePort[]; outputs: RecipePort[]; powerMW: number } | undefined {
  const recipe = getRecipe(recipeId);
  if (!recipe) return undefined;
  const k = clockSpeed / 100;
  return {
    inputs: recipe.inputs.map(p => ({ ...p, rate: p.rate * k })),
    outputs: recipe.outputs.map(p => ({ ...p, rate: p.rate * k })),
    // Satisfactory 功耗公式：P = base × (clock/100)^1.321928
    powerMW: recipe.powerMW * Math.pow(k, 1.321928),
  };
}

/**
 * 生成人类可读的配方标签（替代旧版 machine.recipe 字符串字段）。
 * 例: "铁棒×5+螺丝×25→转子"
 */
export function formatRecipeLabel(recipeId: string | undefined): string {
  const recipe = getRecipe(recipeId);
  if (!recipe) return '—';
  const lhs = recipe.inputs.map(p => p.amount === 1 ? p.item : `${p.item}×${p.amount}`).join('+');
  const rhs = recipe.outputs.map(p => p.amount === 1 ? p.item : `${p.item}×${p.amount}`).join('+');
  return lhs ? `${lhs}→${rhs}` : rhs;
}
