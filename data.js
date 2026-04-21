(() => {
  var e,
    t = {};
  t.g = function () {
    if ("object" == typeof globalThis) return globalThis;
    try {
      return this || new Function("return this")();
    } catch (e) {
      if ("object" == typeof window) return window;
    }
  }();
  (e = "undefined" != typeof window ? window : void 0 !== t.g ? t.g : "undefined" != typeof self ? self : {}).SENTRY_RELEASE = {
    id: "ab764377b840cc9bfdffcf57e6188bb72147c4e6"
  };
  e.SENTRY_RELEASES = e.SENTRY_RELEASES || {};
  e.SENTRY_RELEASES["satisfactory@sentry"] = {
    id: "ab764377b840cc9bfdffcf57e6188bb72147c4e6"
  };
  (() => {
    "use strict";

    function e(e) {
      self.workerClass = new e(self);
    }
    class Worker_Wrapper {
      constructor(e) {
        this.baseUrls = {};
        this.url = {};
        this.debug = !1;
        this.language = "en";
        this.translate = {};
        this.buildings = {};
        this.items = {};
        this.recipes = {};
        this.options = {
          maxBeltSpeed: 780,
          maxPipeSpeed: 6e5,
          oreType: "Build_MinerMk2_C",
          oreSpeed: "RP_Normal",
          oilType: "Build_OilPump_C",
          oilSpeed: "RP_Normal",
          waterType: "Build_WaterPump_C",
          waterSpeed: "RP_Normal",
          gasType: "Build_FrackingExtractor_C",
          gasSpeed: "RP_Normal"
        };
        this.inputItems = {};
        this.requestedItems = [];
        this.altRecipes = [];
        this.convRecipes = [];
        this.requiredPower = 0;
        this.listItems = {};
        this.listBuildings = {};
        this.nodeIdKey = 0;
        this.graphNodes = [];
        this.graphEdges = [];
        this.worker = e;
        this.worker.onmessage = function (e) {
          this.baseUrls = e.data.baseUrls;
          this.debug = e.data.debug;
          this.language = e.data.language;
          this.translate = e.data.translate;
          this.buildings = e.data.buildings;
          this.items = e.data.items;
          this.recipes = e.data.recipes;
          return this.initiate(e.data.formData);
        }.bind(this);
        this.postMessage({
          type: "showLoader"
        });
      }
      initiate(e) {
        this.postMessage({
          type: "updateLoaderText",
          text: "Checking requested items..."
        });
        for (let t in this.items) void 0 !== e[t] && void 0 !== this.items[t] && (this.url[t] = e[t], this.requestedItems.push({
          id: t,
          qty: e[t]
        }));
        void 0 !== e.input && (this.url.input = e.input, this.inputItems = e.input);
        if (void 0 === e.mods && void 0 !== e.activatedMods && e.activatedMods.length > 0) {
          this.url.mods = [];
          for (let t = 0; t < e.activatedMods.length; t++) this.url.mods.push(e.activatedMods[t].data.idSML);
        } else void 0 !== e.mods && (this.url.mods = e.mods);
        if (void 0 !== e.altRecipes) {
          this.postMessage({
            type: "updateLoaderText",
            text: "Applying alternative recipes..."
          });
          this.altRecipes = [];
          for (let t = 0; t < e.altRecipes.length; t++) {
            let i = e.altRecipes[t];
            void 0 !== this.recipes[i] && this.altRecipes.push(i);
          }
          this.altRecipes.length > 0 && (this.url.altRecipes = this.altRecipes);
        }
        if (void 0 !== e.convRecipes) {
          this.postMessage({
            type: "updateLoaderText",
            text: "Applying Converter recipes..."
          });
          this.convRecipes = [];
          for (let t = 0; t < e.convRecipes.length; t++) {
            let i = e.convRecipes[t];
            void 0 !== this.recipes[i] && this.convRecipes.push(i);
          }
          this.convRecipes.length > 0 && (this.url.convRecipes = this.convRecipes);
        }
        this.postMessage({
          type: "updateUrl",
          url: this.url
        });
        this.startCalculation();
      }
      postMessage(e) {
        return this.worker.postMessage(e);
      }
      startCalculation() {
        this.requestedItems.sort((e, t) => void 0 !== this.items[e.id].energy && void 0 === this.items[t.id].energy ? 1 : void 0 === this.items[e.id].energy && "fuel" !== this.items[t.id].energy ? -1 : void 0);
        this.addInputs();
      }
      endCalculation() {
        this.addLabels();
        this.postMessage({
          type: "updateLoaderText",
          text: "Generating buildings layout..."
        });
        this.postMessage({
          type: "updateGraphNetwork",
          nodes: this.graphNodes,
          edges: this.graphEdges
        });
        this.postMessage({
          type: "updateRequiredPower",
          power: this.requiredPower
        });
        this.postMessage({
          type: "updateItemsList",
          data: this.listItems
        });
        this.postMessage({
          type: "updateBuildingsList",
          data: this.listBuildings
        });
        this.generateTreeList();
        this.postMessage({
          type: "done"
        });
      }
      addInputs() {
        this.postMessage({
          type: "updateLoaderText",
          text: "Add inputs resources..."
        });
        for (let e in this.inputItems) {
          let t = parseFloat(this.inputItems[e]),
            i = this.options.maxBeltSpeed;
          for (["liquid", "gas"].includes(this.items[e].category) && (t *= 1e3, i = this.options.maxPipeSpeed); t >= i;) {
            this.graphNodes.push({
              data: {
                id: e + "_" + this.nodeIdKey++ + "_byProduct",
                nodeType: "byProductItem",
                itemId: e,
                qtyUsed: 0,
                qtyProduced: i,
                neededQty: i,
                image: this.items[e].image
              }
            });
            t -= i;
          }
          t > 0 && this.graphNodes.push({
            data: {
              id: e + "_" + this.nodeIdKey++ + "_byProduct",
              nodeType: "byProductItem",
              itemId: e,
              qtyUsed: 0,
              qtyProduced: t,
              neededQty: t,
              image: this.items[e].image
            }
          });
        }
      }
      addLabels() {
        this.postMessage({
          type: "updateLoaderText",
          text: "Add labels..."
        });
        for (let e = 0; e < this.graphEdges.length; e++) {
          let t = this.graphEdges[e].data,
            i = this.items[t.itemId].name;
          void 0 !== t.useAlternateRecipe && null !== t.useAlternateRecipe && (i = this.alternative[t.useAlternateRecipe].name);
          +Math.round(10 * t.qty) / 10 < 0.1 ? this.graphEdges[e].data.label = i + " (< " + new Intl.NumberFormat(this.language).format(0.1) + "/min)" : "liquid" === this.items[t.itemId].category || "gas" === this.items[t.itemId].category ? this.graphEdges[e].data.label = i + " (" + new Intl.NumberFormat(this.language).format(Math.round(Math.round(t.qty) / 1e3)) + " m³/min)" : this.graphEdges[e].data.label = i + " (" + new Intl.NumberFormat(this.language).format(Math.round(100 * t.qty) / 100) + " units/min)";
          void 0 !== this.items[t.itemId].color && (this.graphEdges[e].data.color = this.items[t.itemId].color);
        }
        for (let e = 0; e < this.graphNodes.length; e++) {
          let t = this.graphNodes[e].data;
          "mainNode" === t.nodeType && ("liquid" === this.items[t.itemId].category || "gas" === this.items[t.itemId].category ? this.graphNodes[e].data.label = new Intl.NumberFormat(this.language).format(Math.round(Math.round(t.qty) / 1e3)) + " m³ " + this.items[t.itemId].name : this.graphNodes[e].data.label = new Intl.NumberFormat(this.language).format(Math.round(100 * t.qty) / 100) + " " + this.items[t.itemId].name);
          "merger" === t.nodeType && ("liquid" === this.items[t.itemId].category || "gas" === this.items[t.itemId].category ? (this.graphNodes[e].data.label = this.buildings.Build_PipelineJunction_Cross_C.name + "\n(" + this.items[t.itemId].name + ")", this.graphNodes[e].data.image = this.buildings.Build_PipelineJunction_Cross_C.image, void 0 === this.listBuildings.Build_PipelineJunction_Cross_C && (this.listBuildings.Build_PipelineJunction_Cross_C = 0), this.listBuildings.Build_PipelineJunction_Cross_C++) : (this.graphNodes[e].data.label = this.buildings.Build_ConveyorAttachmentMerger_C.name + "\n(" + this.items[t.itemId].name + ")", this.graphNodes[e].data.image = this.buildings.Build_ConveyorAttachmentMerger_C.image, void 0 === this.listBuildings.Build_ConveyorAttachmentMerger_C && (this.listBuildings.Build_ConveyorAttachmentMerger_C = 0), this.listBuildings.Build_ConveyorAttachmentMerger_C++));
          "splitter" === t.nodeType && ("liquid" === this.items[t.itemId].category || "gas" === this.items[t.itemId].category ? (this.graphNodes[e].data.label = this.buildings.Build_PipelineJunction_Cross_C.name + "\n(" + this.items[t.itemId].name + ")", this.graphNodes[e].data.image = this.buildings.Build_PipelineJunction_Cross_C.image, void 0 === this.listBuildings.Build_PipelineJunction_Cross_C && (this.listBuildings.Build_PipelineJunction_Cross_C = 0), this.listBuildings.Build_PipelineJunction_Cross_C++) : (this.graphNodes[e].data.label = this.buildings.Build_ConveyorAttachmentSplitter_C.name + "\n(" + this.items[t.itemId].name + ")", this.graphNodes[e].data.image = this.buildings.Build_ConveyorAttachmentSplitter_C.image, void 0 === this.listBuildings.Build_ConveyorAttachmentSplitter_C && (this.listBuildings.Build_ConveyorAttachmentSplitter_C = 0), this.listBuildings.Build_ConveyorAttachmentSplitter_C++));
          if ("productionBuilding" === t.nodeType) {
            let i = t.qtyUsed / t.qtyProducedDefault * 100;
            this.graphNodes[e].data.performance = Math.round(i);
            this.graphNodes[e].data.performanceColor = "Build_Workshop_C" === t.buildingType ? "rgb(255, 255, 255)" : this.getColorForPercentage(Math.min(100, Math.round(i)));
            this.graphNodes[e].data.borderWidth = "15px";
            this.graphNodes[e].data.label = ("Build_Workshop_C" === t.buildingType ? "" : "x" + new Intl.NumberFormat(this.language).format(Math.ceil(i) / 100) + " ") + this.buildings[t.buildingType].name + "\n(" + this.recipes[this.graphNodes[e].data.recipe].name + ")";
            void 0 === this.listItems[t.itemOut] && (this.listItems[t.itemOut] = 0);
            "liquid" === this.items[t.itemOut].category || "gas" === this.items[t.itemOut].category ? this.listItems[t.itemOut] += t.qtyUsed / 1e3 : this.listItems[t.itemOut] += t.qtyUsed;
          }
          "lastNodeItem" !== t.nodeType && "byProductItem" !== t.nodeType || ("liquid" === this.items[t.itemId].category || "gas" === this.items[t.itemId].category ? this.graphNodes[e].data.label = new Intl.NumberFormat(this.language).format(Math.round(Math.round(t.neededQty) / 1e3)) + " m³ " + this.items[t.itemId].name : this.graphNodes[e].data.label = new Intl.NumberFormat(this.language).format(Math.round(100 * t.neededQty) / 100) + " " + this.items[t.itemId].name, "byProductItem" === t.nodeType && (this.graphNodes[e].data.label += "*"), void 0 === this.listItems[t.itemId] && (this.listItems[t.itemId] = 0), "liquid" === this.items[t.itemId].category || "gas" === this.items[t.itemId].category ? this.listItems[t.itemId] += t.neededQty / 1e3 : this.listItems[t.itemId] += t.neededQty);
        }
      }
      getColorForPercentage(e) {
        e /= 100;
        let t = [{
            pct: 0,
            color: {
              r: 255,
              g: 0,
              b: 0
            }
          }, {
            pct: 0.5,
            color: {
              r: 255,
              g: 255,
              b: 0
            }
          }, {
            pct: 1,
            color: {
              r: 0,
              g: 255,
              b: 0
            }
          }],
          i = 1;
        for (; i < t.length - 1 && !(e < t[i].pct); i++);
        let s = t[i - 1],
          a = t[i],
          d = a.pct - s.pct,
          r = (e - s.pct) / d,
          o = 1 - r,
          h = r,
          l = {
            r: Math.floor(s.color.r * o + a.color.r * h),
            g: Math.floor(s.color.g * o + a.color.g * h),
            b: Math.floor(s.color.b * o + a.color.b * h)
          };
        return "rgb(" + [l.r, l.g, l.b].join(",") + ")";
      }
      getItemIdFromClassName(e) {
        for (let t in this.items) if (this.items[t].className === e) return t;
        return null;
      }
      isAlternateRecipe(e) {
        return "/Game/FactoryGame/Recipes/AlternateRecipes/Parts/Recipe_Alternate_Turbofuel.Recipe_Alternate_Turbofuel_C" !== e.className && "/Game/FactoryGame/Recipes/AlternateRecipes/Parts/Recipe_Alternate_EnrichedCoal.Recipe_Alternate_EnrichedCoal_C" !== e.className && (!!e.className.startsWith("/Game/FactoryGame/Recipes/AlternateRecipes") || !!e.className.startsWith("/Game/FactoryGame/Recipes/Converter/ResourceConversion/Recipe_") || -1 !== e.className.search("Recipe_Residual") || -1 !== e.className.search("_Alt.Recipe_") || -1 !== e.className.search(".Recipe_Alt_RP_"));
      }
      getRecipeToProduceItemId(e) {
        if (void 0 === this.items[e]) {
          console.log("Missing item...", e);
          return null;
        }
        let t = this.items[e].className,
          i = ["Recipe_Biomass_AlienOrgans_C", "Recipe_Biomass_AlienCarapace_C", "Recipe_Protein_Hog_C", "Recipe_Protein_Spitter_C", "Recipe_Protein_Crab_C", "Recipe_Protein_Stinger_C"],
          s = [];
        for (let s = 0; s < this.altRecipes.length; s++) {
          let a = this.altRecipes[s];
          if (!i.includes(a) && "Desc_Water_C" !== e && void 0 !== this.recipes[a] && void 0 !== this.recipes[a].produce[t]) {
            if ("Recipe_Alternate_RecycledRubber_C" === a && this.altRecipes.includes("Recipe_Alternate_Plastic_1_C")) continue;
            if ("Desc_CompactedCoal_C" === e && this.altRecipes.includes("Recipe_Alternate_IonizedFuel_Dark_C")) continue;
            if ("Desc_DarkEnergy_C" === e && this.altRecipes.includes("Recipe_SyntheticPowerShard_C")) continue;
            return a;
          }
        }
        for (let s = 0; s < this.convRecipes.length; s++) {
          let a = this.convRecipes[s];
          if (!i.includes(a) && "Desc_Water_C" !== e && void 0 !== this.recipes[a] && void 0 !== this.recipes[a].produce[t]) {
            if ("Recipe_Bauxite_Caterium_C" === a && this.convRecipes.includes("Recipe_Nitrogen_Bauxite_C")) continue;
            if ("Recipe_Bauxite_Caterium_C" === a && this.convRecipes.includes("Recipe_Quartz_Bauxite_C")) continue;
            if ("Recipe_Bauxite_Caterium_C" === a && this.convRecipes.includes("Recipe_Uranium_Bauxite_C")) continue;
            if ("Recipe_Bauxite_Copper_C" === a && this.convRecipes.includes("Recipe_Nitrogen_Bauxite_C")) continue;
            if ("Recipe_Bauxite_Copper_C" === a && this.convRecipes.includes("Recipe_Quartz_Bauxite_C")) continue;
            if ("Recipe_Bauxite_Copper_C" === a && this.convRecipes.includes("Recipe_Uranium_Bauxite_C")) continue;
            if ("Recipe_Caterium_Copper_C" === a && this.convRecipes.includes("Recipe_Bauxite_Caterium_C")) continue;
            if ("Recipe_Caterium_Copper_C" === a && this.convRecipes.includes("Recipe_Nitrogen_Caterium_C")) continue;
            if ("Recipe_Caterium_Quartz_C" === a && this.convRecipes.includes("Recipe_Bauxite_Caterium_C")) continue;
            if ("Recipe_Caterium_Quartz_C" === a && this.convRecipes.includes("Recipe_Nitrogen_Caterium_C")) continue;
            if ("Recipe_Coal_Iron_C" === a && this.convRecipes.includes("Recipe_Quartz_Coal_C")) continue;
            if ("Recipe_Coal_Iron_C" === a && this.convRecipes.includes("Recipe_Sulfur_Coal_C")) continue;
            if ("Recipe_Coal_Limestone_C" === a && this.convRecipes.includes("Recipe_Quartz_Coal_C")) continue;
            if ("Recipe_Coal_Limestone_C" === a && this.convRecipes.includes("Recipe_Sulfur_Coal_C")) continue;
            if ("Recipe_Copper_Quartz_C" === a && this.convRecipes.includes("Recipe_Bauxite_Copper_C")) continue;
            if ("Recipe_Copper_Quartz_C" === a && this.convRecipes.includes("Recipe_Caterium_Copper_C")) continue;
            if ("Recipe_Copper_Sulfur_C" === a && this.convRecipes.includes("Recipe_Bauxite_Copper_C")) continue;
            if ("Recipe_Copper_Sulfur_C" === a && this.convRecipes.includes("Recipe_Caterium_Copper_C")) continue;
            if ("Recipe_Iron_Limestone_C" === a && this.convRecipes.includes("Recipe_Limestone_Sulfur_C")) continue;
            if ("Recipe_Limestone_Sulfur_C" === a && this.convRecipes.includes("Recipe_Coal_Limestone_C")) continue;
            if ("Recipe_Limestone_Sulfur_C" === a && this.convRecipes.includes("Recipe_Iron_Limestone_C")) continue;
            if ("Recipe_Quartz_Bauxite_C" === a && this.convRecipes.includes("Recipe_Caterium_Quartz_C")) continue;
            if ("Recipe_Quartz_Bauxite_C" === a && this.convRecipes.includes("Recipe_Copper_Quartz_C")) continue;
            if ("Recipe_Quartz_Coal_C" === a && this.convRecipes.includes("Recipe_Caterium_Quartz_C")) continue;
            if ("Recipe_Quartz_Coal_C" === a && this.convRecipes.includes("Recipe_Copper_Quartz_C")) continue;
            if ("Recipe_Sulfur_Coal_C" === a && this.convRecipes.includes("Recipe_Copper_Sulfur_C")) continue;
            if ("Recipe_Sulfur_Coal_C" === a && this.convRecipes.includes("Recipe_Limestone_Sulfur_C")) continue;
            if ("Recipe_Sulfur_Iron_C" === a && this.convRecipes.includes("Recipe_Copper_Sulfur_C")) continue;
            if ("Recipe_Sulfur_Iron_C" === a && this.convRecipes.includes("Recipe_Limestone_Sulfur_C")) continue;
            return a;
          }
        }
        for (let e in this.recipes) i.includes(e) || !1 === this.isAlternateRecipe(this.recipes[e]) && void 0 !== this.recipes[e].produce && void 0 !== this.recipes[e].produce[t] && s.push(e);
        0 === s.length && "Desc_DissolvedSilica_C" === e && (this.postMessage({
          type: "addAlternateRecipe",
          recipeId: "Recipe_Alternate_Quartz_Purified_C"
        }), s.push("Recipe_Alternate_Quartz_Purified_C"));
        return s.length > 0 ? (s.sort(function (t, i) {
          let s = Object.keys(this.recipes[t].produce).length,
            a = Object.keys(this.recipes[i].produce).length;
          if (s === a) {
            if (!0 === this.isAlternateRecipe(this.recipes[t]) && !1 === this.isAlternateRecipe(this.recipes[i])) return 1;
            if (!1 === this.isAlternateRecipe(this.recipes[t]) && !0 === this.isAlternateRecipe(this.recipes[i])) return -1;
            let s = null,
              a = null;
            for (let i in this.recipes[t].produce) if (i === e) {
              s = 60 / this.recipes[t].mManufactoringDuration * this.recipes[t].produce[i];
              break;
            }
            for (let t in this.recipes[i].produce) if (t === e) {
              a = 60 / this.recipes[i].mManufactoringDuration * this.recipes[i].produce[t];
              break;
            }
            return null !== s && null !== a && s !== a ? a - s : "Desc_HeavyOilResidue_C" === e && "Recipe_Rubber_C" === t && "Recipe_Plastic_C" === i ? -1 : "Desc_HeavyOilResidue_C" === e && "Recipe_Plastic_C" === t && "Recipe_Rubber_C" === i ? 1 : this.recipes[t].className.localeCompare(this.recipes[i].className);
          }
          return s - a;
        }.bind(this)), s[0]) : null;
      }
      getProductionBuildingFromRecipeId(e) {
        if (void 0 !== this.recipes[e].mProducedIn) for (let t = this.recipes[e].mProducedIn.length - 1; t >= 0; t--) {
          let i = this.recipes[e].mProducedIn[t];
          if ("/Game/FactoryGame/Buildable/-Shared/WorkBench/BP_WorkshopComponent.BP_WorkshopComponent_C" === i && 1 === this.recipes[e].mProducedIn.length) return "Build_Workshop_C";
          for (let t in this.buildings) if (this.buildings[t].className === i) {
            if ("Recipe_CrudeOil_C" === e && "Build_OilPump_C" === this.options.oilType && "Build_OilPump_C" !== t) continue;
            if ("Recipe_CrudeWater_C" === e && "Build_WaterPump_C" === this.options.waterType && "Build_WaterPump_C" !== t) continue;
            return t;
          }
        }
        return null;
      }
      generateTreeList() {
        this.postMessage({
          type: "updateLoaderText",
          text: "Generating production list..."
        });
        let e = [];
        if (0 === this.requestedItems.length) e.push('<p class="p-3 text-center">Please select at least one item in the production list.</p>');else {
          e.push('<div class="row">');
          for (let t = 0; t < this.requestedItems.length; t++) {
            this.requestedItems.length >= 1 ? e.push('<div class="col-sm-6">') : e.push("<div>");
            e.push('<div class="p-3">');
            e.push('<div class="hierarchyTree">');
            e.push('<div class="root">');
            e.push('<div class="child">');
            e.push('<img src="' + this.items[this.requestedItems[t].id].image + '" style="width: 40px;" class="mr-3" />');
            "liquid" === this.items[this.requestedItems[t].id].category || "gas" === this.items[this.requestedItems[t].id].category ? e.push(new Intl.NumberFormat(this.language).format(this.requestedItems[t].qty) + "m³ ") : e.push(new Intl.NumberFormat(this.language).format(this.requestedItems[t].qty) + "x ");
            void 0 !== this.items[this.requestedItems[t].id].url ? e.push('<a href="' + this.items[this.requestedItems[t].id].url + '"style="line-height: 40px;">' + this.items[this.requestedItems[t].id].name + "</a>") : e.push('<a href="' + this.baseUrls.items + "/id/" + this.requestedItems[t].id + "/name/" + this.items[this.requestedItems[t].id].name + '"style="line-height: 40px;">' + this.items[this.requestedItems[t].id].name + "</a>");
            for (let i = 0; i < this.graphNodes.length; i++) "mainNode" === this.graphNodes[i].data.nodeType && this.graphNodes[i].data.itemId === this.requestedItems[t].id && e.push(this.buildHierarchyTree(this.graphNodes[i].data.id));
            e.push("</div>");
            e.push("</div>");
            e.push("</div>");
            e.push("</div>");
            e.push("</div>");
          }
          e.push("</div>");
        }
        this.postMessage({
          type: "updateTreeList",
          data: e.join("")
        });
      }
      buildHierarchyTree(e) {
        let t = [],
          i = [];
        for (let t = 0; t < this.graphEdges.length; t++) this.graphEdges[t].data.target === e && i.push(this.graphEdges[t]);
        if (i.length > 0) {
          t.push('<div class="parent">');
          for (let e = 0; e < i.length; e++) for (let s = 0; s < this.graphNodes.length; s++) this.graphNodes[s].data.id === i[e].data.source && (t.push('<div class="child">'), t.push('<div class="media">'), "lastNodeItem" === this.graphNodes[s].data.nodeType || "byProductItem" === this.graphNodes[s].data.nodeType ? (t.push('<img src="' + this.items[this.graphNodes[s].data.itemId].image + '" alt="' + this.items[this.graphNodes[s].data.itemId].name + '" style="width: 40px;" class="mr-3" />'), t.push('<div class="media-body">'), "liquid" === this.items[this.graphNodes[s].data.itemId].category || "gas" === this.items[this.graphNodes[s].data.itemId].category ? t.push(new Intl.NumberFormat(this.language).format(this.graphNodes[s].data.neededQty / 1e3) + "m³ ") : t.push(new Intl.NumberFormat(this.language).format(this.graphNodes[s].data.neededQty) + "x "), void 0 !== this.items[this.graphNodes[s].data.itemId].url ? t.push('<a href="' + this.items[this.graphNodes[s].data.itemId].url + '" style="line-height: 40px;">' + this.items[this.graphNodes[s].data.itemId].name + "</a>") : t.push('<a href="' + this.baseUrls.items + "/id/" + this.graphNodes[s].data.itemId + "/name/" + this.items[this.graphNodes[s].data.itemId].name + '" style="line-height: 40px;">' + this.items[this.graphNodes[s].data.itemId].name + "</a>"), t.push("</div>")) : ("merger" === this.graphNodes[s].data.nodeType && ("liquid" === this.items[this.graphNodes[s].data.itemId].category || "gas" === this.items[this.graphNodes[s].data.itemId].category ? this.graphNodes[s].data.buildingType = "Build_PipelineJunction_Cross_C" : this.graphNodes[s].data.buildingType = "Build_ConveyorAttachmentMerger_C"), "splitter" === this.graphNodes[s].data.nodeType && ("liquid" === this.items[this.graphNodes[s].data.itemId].category || "gas" === this.items[this.graphNodes[s].data.itemId].category ? this.graphNodes[s].data.buildingType = "Build_PipelineJunction_Cross_C" : this.graphNodes[s].data.buildingType = "Build_ConveyorAttachmentSplitter_C"), t.push('<img src="' + this.buildings[this.graphNodes[s].data.buildingType].image + '" alt="' + this.buildings[this.graphNodes[s].data.buildingType].name + '" style="width: 40px;" class="mr-3 collapseChildren" />'), t.push('<div class="media-body">'), void 0 !== this.buildings[this.graphNodes[s].data.buildingType].url ? t.push('<a href="' + this.buildings[this.graphNodes[s].data.buildingType].url + '">' + this.buildings[this.graphNodes[s].data.buildingType].name + "</a>") : t.push('<a href="' + this.baseUrls.buildings + "/id/" + this.graphNodes[s].data.buildingType + "/name/" + this.buildings[this.graphNodes[s].data.buildingType].name + '">' + this.buildings[this.graphNodes[s].data.buildingType].name + "</a>"), "productionBuilding" === this.graphNodes[s].data.nodeType && t.push(this.treeListProductionBuilding(this.graphNodes[s].data.performanceColor, this.graphNodes[s].data.performance)), t.push("<br />"), t.push("<small>" + i[e].data.label + "</small>"), t.push("</div>")), t.push("</div>"), "byProductItem" !== this.graphNodes[s].data.nodeType && t.push(this.buildHierarchyTree(this.graphNodes[s].data.id)), t.push("</div>"));
          t.push("</div>");
        }
        return t.join("");
      }
      treeListProductionBuilding(e, t) {
        return ' <em style="color: ' + e + '">(' + t + "%)</em>";
      }
    }
    class Solver_Simple extends Worker_Wrapper {
      constructor(e) {
        super(e);
      }
      initiate(e) {
        this.options.maxBeltSpeed = Number.MAX_SAFE_INTEGER;
        this.options.maxPipeSpeed = Number.MAX_SAFE_INTEGER;
        super.initiate(e);
      }
      startCalculation() {
        super.startCalculation();
        this.doCalculation();
        this.endCalculation();
      }
      doCalculation() {
        for (let e = 0; e < this.requestedItems.length; e++) {
          let t = this.requestedItems[e].qty,
            i = this.options.maxBeltSpeed;
          for ("liquid" !== this.items[this.requestedItems[e].id].category && "gas" !== this.items[this.requestedItems[e].id].category || (t *= 1e3, i = this.options.maxPipeSpeed); t >= i;) {
            this.startMainNode(this.requestedItems[e].id, i);
            t -= i;
          }
          t > 0 && this.startMainNode(this.requestedItems[e].id, t);
        }
      }
      startMainNode(e, t) {
        console.log("startMainNode", e, t);
        let i = this.getRecipeToProduceItemId(e);
        console.log("currentRecipe", i);
        if (null !== i) {
          "liquid" === this.items[e].category || "gas" === this.items[e].category ? this.postMessage({
            type: "updateLoaderText",
            text: "Calculating production of " + new Intl.NumberFormat(this.language).format(t / 1e3) + "m³ " + this.items[e].name + "..."
          }) : this.postMessage({
            type: "updateLoaderText",
            text: "Calculating production of " + new Intl.NumberFormat(this.language).format(t) + " " + this.items[e].name + "..."
          });
          let s = e + "_" + this.nodeIdKey;
          for (this.nodeIdKey++, this.graphNodes.push({
            data: {
              id: s,
              nodeType: "mainNode",
              itemId: e,
              qty: t,
              image: this.items[e].image
            }
          }); t > 0;) {
            let a = !1;
            for (let i = 0; i < this.graphNodes.length; i++) if ("byProductItem" === this.graphNodes[i].data.nodeType && this.graphNodes[i].data.itemId === e) {
              let d = this.graphNodes[i].data.qtyProduced - this.graphNodes[i].data.qtyUsed,
                r = Math.min(d, t);
              r < 0 && (r = d);
              if (d > 0 && r > 0) {
                let d = !1;
                for (let e = 0; e < this.graphEdges.length; e++) if (this.graphEdges[e].data.source === this.graphNodes[i].data.id && this.graphEdges[e].data.target === s) {
                  this.graphEdges[e].data.qty += r;
                  d = !0;
                  break;
                }
                !1 === d && this.graphEdges.push({
                  data: {
                    id: this.graphNodes[i].data.id + "_" + s,
                    source: this.graphNodes[i].data.id,
                    target: s,
                    itemId: e,
                    qty: r
                  }
                });
                this.graphNodes[i].data.qtyUsed += r;
                t -= r;
                a = !0;
              }
            }
            if (!1 === a) {
              let a = this.buildCurrentNodeTree({
                id: e,
                recipe: i,
                qty: t,
                visId: s,
                level: 1
              });
              if (!1 === a) break;
              t -= a;
            }
          }
        }
      }
      buildCurrentNodeTree(e) {
        !0 === this.debug && console.log("buildCurrentNodeTree", e.qty, e.recipe, e.level);
        let t = this.getProductionBuildingFromRecipeId(e.recipe);
        if (null !== t) {
          let i = 4,
            s = 1,
            a = !1;
          this.nodeIdKey++;
          if (void 0 !== this.buildings[t].extractionRate) switch (i = 0.5, t) {
            case "Build_FrackingExtractor_C":
              "Recipe_CrudeOil_C" === e.recipe ? void 0 !== this.buildings[t].extractionRate[this.options.oilSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.oilSpeed]) : "Recipe_CrudeWater_C" === e.recipe ? void 0 !== this.buildings[t].extractionRate[this.options.waterSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.waterSpeed]) : void 0 !== this.buildings[t].extractionRate[this.options.gasSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.gasSpeed]);
              break;
            case "Build_OilPump_C":
              void 0 !== this.buildings[t].extractionRate[this.options.oilSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.oilSpeed]);
              break;
            case "Build_WaterPump_C":
              i = 60 / this.buildings[t].extractionRate.RP_Normal;
              break;
            default:
              void 0 !== this.buildings[t].extractionRate[this.options.oreSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.oreSpeed]);
          } else {
            void 0 !== this.recipes[e.recipe].ingredients && (a = this.recipes[e.recipe].ingredients);
            void 0 !== this.recipes[e.recipe].mManufactoringDuration && (i = this.recipes[e.recipe].mManufactoringDuration);
            void 0 !== this.recipes[e.recipe].mManualManufacturingMultiplier && "Build_Workshop_C" === t && (i *= this.recipes[e.recipe].mManualManufacturingMultiplier);
            if (void 0 !== this.recipes[e.recipe].produce) for (let t in this.recipes[e.recipe].produce) t === this.items[e.id].className && (s = this.recipes[e.recipe].produce[t]);
          }
          let d = t + "_" + this.nodeIdKey,
            r = 60 / i * s,
            o = Math.min(r, e.qty),
            h = !1;
          for (let t = 0; t < this.graphNodes.length; t++) if ("productionBuilding" === this.graphNodes[t].data.nodeType && this.graphNodes[t].data.recipe === e.recipe && e.id === this.graphNodes[t].data.itemOut) {
            d = this.graphNodes[t].data.id;
            this.graphNodes[t].data.qtyProduced += r;
            this.graphNodes[t].data.qtyUsed += o;
            let i = !1;
            for (let t = 0; t < this.graphEdges.length; t++) if (this.graphEdges[t].data.source === d && this.graphEdges[t].data.target === e.visId) {
              this.graphEdges[t].data.qty += o;
              i = !0;
              break;
            }
            !1 === i && this.graphEdges.push({
              data: {
                id: d + "_" + e.visId,
                source: d,
                target: e.visId,
                itemId: e.id,
                recipe: e.recipe,
                qty: o
              }
            });
            h = !0;
            break;
          }
          !1 === h && (this.graphNodes.push({
            data: {
              id: d,
              nodeType: "productionBuilding",
              buildingType: t,
              recipe: e.recipe,
              itemOut: e.id,
              qtyProducedDefault: "Build_Workshop_C" === t ? 999999999 : r,
              qtyProduced: "Build_Workshop_C" === t ? 999999999 : r,
              qtyUsed: o,
              clockSpeed: 100,
              image: this.buildings[t].image
            }
          }), this.graphEdges.push({
            data: {
              id: d + "_" + e.visId,
              source: d,
              target: e.visId,
              itemId: e.id,
              recipe: e.recipe,
              qty: o
            }
          }));
          if (void 0 !== this.buildings[t].supplementalLoadType && void 0 !== this.buildings[t].powerGenerated) {
            let i = void 0 !== this.buildings[t].supplementalLoadRatio ? this.buildings[t].supplementalLoadRatio : 1,
              s = void 0 !== this.buildings[t].powerProductionExponent ? this.buildings[t].powerProductionExponent : 1,
              a = this.buildings[t].supplementalLoadType,
              h = o / r * (this.buildings[t].powerGenerated * Math.pow(1, 1 / s) * 60 * i),
              l = this.getRecipeToProduceItemId(this.buildings[t].supplementalLoadType);
            for (; h > 0;) {
              let t = !1;
              for (let e = 0; e < this.graphNodes.length; e++) if ("byProductItem" === this.graphNodes[e].data.nodeType && this.graphNodes[e].data.itemId === a) {
                let i = this.graphNodes[e].data.qtyProduced - this.graphNodes[e].data.qtyUsed,
                  s = Math.min(i, h);
                s < 0 && (s = i);
                if (i > 0 && s > 0) {
                  let i = !1;
                  for (let t = 0; t < this.graphEdges.length; t++) if (this.graphEdges[t].data.source === this.graphNodes[e].data.id && this.graphEdges[t].data.target === d) {
                    this.graphEdges[t].data.qty += s;
                    i = !0;
                    break;
                  }
                  !1 === i && this.graphEdges.push({
                    data: {
                      id: this.graphNodes[e].data.id + "_" + d,
                      source: this.graphNodes[e].data.id,
                      target: d,
                      itemId: a,
                      qty: s
                    }
                  });
                  this.graphNodes[e].data.qtyUsed += s;
                  h -= s;
                  t = !0;
                  break;
                }
              }
              if (!1 === t) {
                let t = this.buildCurrentNodeTree({
                  id: a,
                  recipe: l,
                  qty: h,
                  visId: d,
                  level: e.level + 1
                });
                if (!1 === t) break;
                h -= t;
              }
            }
          }
          if (void 0 !== this.recipes[e.recipe].produce) for (let t in this.recipes[e.recipe].produce) if (t !== this.items[e.id].className) {
            let i = this.getItemIdFromClassName(t),
              a = o / s * this.recipes[e.recipe].produce[t],
              r = !1;
            for (let t = 0; t < this.graphNodes.length; t++) if ("byProductItem" === this.graphNodes[t].data.nodeType && this.graphNodes[t].data.itemId === i) {
              this.graphNodes[t].data.qtyProduced += a;
              this.graphNodes[t].data.neededQty += a;
              let s = !1;
              for (let e = 0; e < this.graphEdges.length; e++) if (this.graphEdges[e].data.source === d && this.graphEdges[e].data.target === this.graphNodes[t].data.id) {
                this.graphEdges[e].data.qty += a;
                s = !0;
                break;
              }
              !1 === s && this.graphEdges.push({
                data: {
                  id: d + "_" + this.graphNodes[t].data.id,
                  source: d,
                  target: this.graphNodes[t].data.id,
                  itemId: i,
                  recipe: e.recipe,
                  qty: a
                }
              });
              r = !0;
              break;
            }
            !1 === r && (this.graphNodes.push({
              data: {
                id: e.visId + "_byProduct",
                nodeType: "byProductItem",
                itemId: i,
                qtyUsed: 0,
                qtyProduced: a,
                neededQty: a,
                image: this.items[i].image
              }
            }), this.graphEdges.push({
              data: {
                id: d + "_" + e.visId + "_byProduct",
                source: d,
                target: e.visId + "_byProduct",
                itemId: i,
                recipe: e.recipe,
                qty: a
              }
            }));
          }
          if (!1 !== a) for (let t in a) {
            let s = this.getItemIdFromClassName(t),
              h = 60 / i * a[t] * o / r,
              l = this.getRecipeToProduceItemId(s);
            console.log(s, l);
            if (null !== l) for (; h > 0;) {
              let t = !1;
              for (let e = 0; e < this.graphNodes.length; e++) if ("byProductItem" === this.graphNodes[e].data.nodeType && this.graphNodes[e].data.itemId === s) {
                let i = this.graphNodes[e].data.qtyProduced - this.graphNodes[e].data.qtyUsed,
                  a = Math.min(i, h);
                a < 0 && (a = i);
                if (i > 0 && a > 0) {
                  let i = !1;
                  for (let t = 0; t < this.graphEdges.length; t++) if (this.graphEdges[t].data.source === this.graphNodes[e].data.id && this.graphEdges[t].data.target === d) {
                    this.graphEdges[t].data.qty += a;
                    i = !0;
                    break;
                  }
                  !1 === i && this.graphEdges.push({
                    data: {
                      id: this.graphNodes[e].data.id + "_" + d,
                      source: this.graphNodes[e].data.id,
                      target: d,
                      itemId: s,
                      qty: a
                    }
                  });
                  this.graphNodes[e].data.qtyUsed += a;
                  h -= a;
                  t = !0;
                  break;
                }
              }
              if (!1 === t) {
                let t = this.buildCurrentNodeTree({
                  id: s,
                  recipe: l,
                  qty: h,
                  visId: d,
                  level: e.level + 1
                });
                if (!1 === t) break;
                h -= t;
              }
            } else {
              let e = !1;
              for (let t = 0; t < this.graphNodes.length; t++) if ("lastNodeItem" === this.graphNodes[t].data.nodeType && this.graphNodes[t].data.itemId === s) {
                for (let e = 0; e < this.graphEdges.length; e++) if (this.graphEdges[e].data.source === this.graphNodes[t].data.id && this.graphEdges[e].data.target === d) {
                  this.graphEdges[e].data.qty += h;
                  break;
                }
                this.graphNodes[t].data.neededQty += h;
                e = !0;
                break;
              }
              if (!1 === e && null !== s) {
                let e = d + "_" + s;
                this.graphNodes.push({
                  data: {
                    id: e,
                    nodeType: "lastNodeItem",
                    itemId: s,
                    neededQty: h,
                    image: this.items[s].image
                  }
                });
                this.graphEdges.push({
                  data: {
                    id: e + "_" + d,
                    source: e,
                    target: d,
                    itemId: s,
                    useAlternateRecipe: null,
                    qty: h
                  }
                });
              }
            }
          }
          return o;
        }
        return !1;
      }
      addLabels() {
        super.addLabels();
        for (let e = 0; e < this.graphNodes.length; e++) {
          let t = this.graphNodes[e].data;
          if ("productionBuilding" === t.nodeType) {
            void 0 === this.listBuildings[t.buildingType] && (this.listBuildings[t.buildingType] = 0);
            this.listBuildings[t.buildingType] += t.qtyUsed / t.qtyProducedDefault;
            let e = 0;
            "Build_FrackingExtractor_C" === t.buildingType ? this.requiredPower += Math.ceil(t.qtyUsed / t.qtyProducedDefault / 6) * this.buildings.Build_FrackingSmasher_C.powerUsed : (void 0 !== this.buildings[t.buildingType].powerUsed && (e = this.buildings[t.buildingType].powerUsed), void 0 !== this.buildings[t.buildingType].powerUsedRecipes && void 0 !== this.buildings[t.buildingType].powerUsedRecipes[t.recipe] && (e = (this.buildings[t.buildingType].powerUsedRecipes[t.recipe][0] + this.buildings[t.buildingType].powerUsedRecipes[t.recipe][1]) / 2), this.requiredPower += t.qtyUsed / t.qtyProducedDefault * e);
          }
        }
      }
      treeListProductionBuilding(e, t) {
        return ' <em style="color: ' + e + '">(x' + t / 100 + ")</em>";
      }
    }
    class Solver_Realistic extends Worker_Wrapper {
      constructor(e) {
        super(e);
        this.options = {
          useManifolds: 1,
          mergeBuildings: 1,
          maxLevel: null,
          availablePowerShards: 0,
          availableSomerSloops: 0,
          allowMinerOverclocking: !0,
          allowPumpOverclocking: !0,
          allowBuildingOverclocking: !0
        };
      }
      initiate(e) {
        this.url.view = e.view;
        void 0 !== e.mergeBuildings && (this.url.mergeBuildings = e.mergeBuildings, this.options.mergeBuildings = parseInt(e.mergeBuildings), 1 !== this.options.mergeBuildings && delete e.powerShards);
        void 0 !== e.useManifolds && (this.url.useManifolds = e.useManifolds, this.options.useManifolds = parseInt(e.useManifolds));
        void 0 !== e.maxLevel && (this.url.maxLevel = e.maxLevel, this.options.maxLevel = parseInt(e.maxLevel));
        void 0 !== e.maxBeltSpeed && (this.options.maxBeltSpeed !== parseInt(e.maxBeltSpeed) && (this.url.maxBeltSpeed = e.maxBeltSpeed), this.options.maxBeltSpeed = parseInt(e.maxBeltSpeed));
        void 0 !== e.maxPipeSpeed && (this.options.maxPipeSpeed !== parseInt(e.maxPipeSpeed) && (this.url.maxPipeSpeed = e.maxPipeSpeed), this.options.maxPipeSpeed = parseInt(e.maxPipeSpeed));
        this.postMessage({
          type: "updateLoaderText",
          text: "Applying extration rates..."
        });
        if (void 0 !== e.oreExtraction) {
          let t = e.oreExtraction.split(";");
          2 === t.length && (this.options.oreType = t[0], this.options.oreSpeed = t[1]);
          "Build_MinerMk1_C" === this.options.oreType && (delete this.buildings.Build_MinerMk3_C, delete this.buildings.Build_MinerMk2_C);
          "Build_MinerMk2_C" === this.options.oreType && delete this.buildings.Build_MinerMk3_C;
          "Build_MinerMk2_C" === this.options.oreType && "RP_Normal" === this.options.oreSpeed || (this.url.oreExtraction = this.options.oreType + ";" + this.options.oreSpeed);
        }
        if (void 0 !== e.oilExtraction) {
          let t = e.oilExtraction.split(";");
          2 === t.length && (this.options.oilType = t[0], this.options.oilSpeed = t[1]);
          "Build_OilPump_C" === this.options.oilType && "RP_Normal" === this.options.oilSpeed || (this.url.oilExtraction = this.options.oilType + ";" + this.options.oilSpeed);
        }
        if (void 0 !== e.waterExtraction) {
          let t = e.waterExtraction.split(";");
          2 === t.length && (this.options.waterType = t[0], this.options.waterSpeed = t[1]);
          "Build_WaterPump_C" === this.options.waterType && "RP_Normal" === this.options.waterSpeed || (this.url.waterExtraction = this.options.waterType + ";" + this.options.waterSpeed);
        }
        if (void 0 !== e.gasExtraction) {
          let t = e.gasExtraction.split(";");
          2 === t.length && (this.options.gasType = t[0], this.options.gasSpeed = t[1]);
          "Build_FrackingExtractor_C" === this.options.gasType && "RP_Normal" === this.options.gasSpeed || (this.url.gasExtraction = this.options.gasType + ";" + this.options.gasSpeed);
        }
        1 === this.options.mergeBuildings && void 0 !== e.powerShards && e.powerShards > 0 && (this.options.availablePowerShards = parseInt(e.powerShards), this.url.powerShards = e.powerShards, void 0 !== e.minerOverclocking && 1 !== e.minerOverclocking && (this.options.allowMinerOverclocking = !1, this.url.minerOverclocking = e.minerOverclocking), void 0 !== e.pumpOverclocking && 1 !== e.pumpOverclocking && (this.options.allowPumpOverclocking = !1, this.url.pumpOverclocking = e.pumpOverclocking), void 0 !== e.buildingOverclocking && 1 !== e.buildingOverclocking && (this.options.allowBuildingOverclocking = !1, this.url.buildingOverclocking = e.buildingOverclocking));
        1 === this.options.mergeBuildings && void 0 !== e.somerSloops && e.somerSloops > 0 && (this.options.availableSomerSloops = parseInt(e.somerSloops), this.url.somerSloops = e.somerSloops);
        super.initiate(e);
      }
      startCalculation() {
        super.startCalculation();
        this.doCalculation();
        this.endCalculation();
      }
      doCalculation() {
        for (let e = 0; e < this.requestedItems.length; e++) {
          let t = this.requestedItems[e].qty,
            i = this.options.maxBeltSpeed;
          for ("liquid" !== this.items[this.requestedItems[e].id].category && "gas" !== this.items[this.requestedItems[e].id].category || (t *= 1e3, i = this.options.maxPipeSpeed); t >= i;) {
            this.startMainNode(this.requestedItems[e].id, "liquid" === this.items[this.requestedItems[e].id].category || "gas" === this.items[this.requestedItems[e].id].category ? i / 1e3 : i);
            t -= i;
          }
          t > 0 && this.startMainNode(this.requestedItems[e].id, "liquid" === this.items[this.requestedItems[e].id].category || "gas" === this.items[this.requestedItems[e].id].category ? t / 1e3 : t);
        }
        if (1 === this.options.mergeBuildings) {
          this.postMessage({
            type: "updateLoaderText",
            text: "Improving buildings efficiency..."
          });
          for (let e = 1; e <= 2; e++) {
            for (let e = this.graphNodes.length - 1; e >= 0; e--) for (let t = this.graphNodes.length - 1; t >= 0; t--) if (e !== t && void 0 !== this.graphNodes[e] && void 0 !== this.graphNodes[t]) {
              let i = this.graphNodes[e].data,
                s = this.graphNodes[t].data;
              if ("productionBuilding" === i.nodeType && i.nodeType === s.nodeType && i.id !== s.id && i.recipe === s.recipe && 100 === s.clockSpeed) {
                if (1 === this.options.mergeBuildings && this.options.availablePowerShards > 0 && i.qtyUsed + s.qtyUsed > i.qtyProduced && i.clockSpeed < 250) {
                  let e = !1;
                  i.buildingType.startsWith("Build_MinerMk") && !0 === this.options.allowMinerOverclocking && (e = !0);
                  i.buildingType.startsWith("Build_OilPump") && !0 === this.options.allowPumpOverclocking && (e = !0);
                  !1 === i.buildingType.startsWith("Build_MinerMk") && !1 === i.buildingType.startsWith("Build_OilPump") && !0 === this.options.allowBuildingOverclocking && (e = !0);
                  if (!0 === e) for (; this.options.availablePowerShards > 0 && i.qtyUsed + s.qtyUsed > i.qtyProduced && i.clockSpeed < 250;) {
                    this.options.availablePowerShards--;
                    i.clockSpeed += 50;
                    i.qtyProduced = i.qtyProducedDefault * i.clockSpeed / 100;
                  }
                }
                if (i.qtyUsed < i.qtyProducedDefault) {
                  let e = i.qtyUsed + s.qtyUsed,
                    a = 100,
                    d = this.options.maxBeltSpeed;
                  "Build_OilPump_C" !== i.buildingType && "Build_WaterPump_C" !== i.buildingType && "Build_FrackingExtractor_C" !== i.buildingType || (d = this.options.maxPipeSpeed);
                  "liquid" !== this.items[i.itemOut].category && "gas" !== this.items[i.itemOut].category || (d = this.options.maxPipeSpeed);
                  let r = Math.min(e, i.qtyProduced, d);
                  r < e && (a = (r - i.qtyUsed) / (e - i.qtyUsed) * 100);
                  if (r <= i.qtyProduced && r <= d) {
                    if (!0 === this.testEdgesMaxSpeeds(i, s, a) && 100 === a) {
                      let e = 0;
                      for (let t = 0; t < this.graphEdges.length; t++) void 0 !== this.graphEdges[t] && (this.graphEdges[t].data.source === s.id && (this.graphEdges[t].data.source = i.id), this.graphEdges[t].data.target === s.id && (void 0 !== i.isProductionBoosted && e < i.isProductionBoosted ? (e++, delete this.graphEdges[t]) : this.graphEdges[t].data.target = i.id));
                      delete this.graphNodes[t];
                      i.qtyUsed = r;
                    }
                  }
                }
              }
            }
            for (let e = 0; e < this.graphEdges.length; e++) for (let t = 0; t < this.graphEdges.length; t++) e !== t && void 0 !== this.graphEdges[e] && void 0 !== this.graphEdges[t] && this.graphEdges[e].data.source === this.graphEdges[t].data.source && this.graphEdges[e].data.target === this.graphEdges[t].data.target && (this.graphEdges[e].data.qty += this.graphEdges[t].data.qty, delete this.graphEdges[t]);
          }
        }
        if (1 === this.options.useManifolds) {
          this.postMessage({
            type: "updateLoaderText",
            text: "Building manifolds..."
          });
          let e = [],
            t = 0;
          for (let t = this.graphEdges.length - 1; t >= 0; t--) {
            if (void 0 === this.graphEdges[t]) continue;
            let i = this.graphEdges[t],
              s = [],
              a = 0,
              d = this.options.maxBeltSpeed;
            "liquid" !== this.items[i.data.itemId].category && "gas" !== this.items[i.data.itemId].category || (d = this.options.maxPipeSpeed);
            for (let e = this.graphEdges.length - 1; e >= 0; e--) void 0 !== this.graphEdges[e] && i.data.id !== this.graphEdges[e].data.id && i.data.itemId === this.graphEdges[e].data.itemId && i.data.target === this.graphEdges[e].data.target && a + this.graphEdges[e].data.qty <= d && (this.graphEdges[e].data.qty >= 0.1 && (a += this.graphEdges[e].data.qty, s.push(this.graphEdges[e])), delete this.graphEdges[e]);
            s.length > 0 && (i.data.qty >= 0.1 && (a += i.data.qty, s.push(i), e.push({
              origin: i,
              mergerSources: s,
              mergerQty: a
            })), delete this.graphEdges[t]);
          }
          if (e.length > 0) for (let i = 0; i < e.length; i++) {
            t++;
            let s = e[i].origin.data.target,
              a = "merger_" + t,
              d = e[i].mergerQty;
            for (let r = 0; r < e[i].mergerSources.length; r++) {
              r % 2 == 0 && r + 1 < e[i].mergerSources.length && (r > 0 && (t++, s = a, a = "merger_" + t), this.graphNodes.push({
                data: {
                  id: a,
                  nodeType: "merger",
                  itemId: e[i].origin.data.itemId
                }
              }), this.graphEdges.push({
                data: {
                  id: "merger_" + t + "_" + s,
                  source: a,
                  target: s,
                  itemId: e[i].origin.data.itemId,
                  useAlternateRecipe: e[i].origin.data.useAlternateRecipe,
                  qty: d
                }
              }));
              this.graphEdges.push({
                data: {
                  id: e[i].mergerSources[r].data.source + "_" + a,
                  source: e[i].mergerSources[r].data.source,
                  target: a,
                  itemId: e[i].mergerSources[r].data.itemId,
                  useAlternateRecipe: e[i].mergerSources[r].data.useAlternateRecipe,
                  qty: e[i].mergerSources[r].data.qty
                }
              });
              d -= e[i].mergerSources[r].data.qty;
            }
          }
          let i = [],
            s = 0;
          for (let e = 0; e < this.graphEdges.length; e++) {
            let t = [],
              s = 0;
            for (let i = 0; i < this.graphEdges.length; i++) e !== i && void 0 !== this.graphEdges[e] && void 0 !== this.graphEdges[i] && this.graphEdges[e].data.itemId === this.graphEdges[i].data.itemId && this.graphEdges[e].data.source === this.graphEdges[i].data.source && (this.graphEdges[i].data.qty >= 0.1 && (s += this.graphEdges[i].data.qty, t.push(this.graphEdges[i])), delete this.graphEdges[i]);
            t.length > 0 && (this.graphEdges[e].data.qty >= 0.1 && (s += this.graphEdges[e].data.qty, t.push(this.graphEdges[e]), i.push({
              origin: this.graphEdges[e],
              splitterTargets: t,
              splitterQty: s
            })), delete this.graphEdges[e]);
          }
          if (i.length > 0) for (let e = 0; e < i.length; e++) {
            s++;
            let t = i[e].origin.data.source,
              a = "splitter_" + s,
              d = i[e].splitterQty;
            for (let r = 0; r < i[e].splitterTargets.length; r++) {
              r % 2 == 0 && r < i[e].splitterTargets.length - 1 && (r > 0 && (s++, t = a, a = "splitter_" + s), this.graphNodes.push({
                data: {
                  id: a,
                  nodeType: "splitter",
                  itemId: i[e].origin.data.itemId
                }
              }), this.graphEdges.push({
                data: {
                  id: t + "_splitter_" + s,
                  source: t,
                  target: a,
                  itemId: i[e].origin.data.itemId,
                  useAlternateRecipe: i[e].origin.data.useAlternateRecipe,
                  qty: d
                }
              }));
              this.graphEdges.push({
                data: {
                  id: a + "_" + i[e].splitterTargets[r].data.target,
                  source: a,
                  target: i[e].splitterTargets[r].data.target,
                  itemId: i[e].splitterTargets[r].data.itemId,
                  useAlternateRecipe: i[e].splitterTargets[r].data.useAlternateRecipe,
                  qty: i[e].splitterTargets[r].data.qty
                }
              });
              d -= i[e].splitterTargets[r].data.qty;
            }
          }
        }
        this.graphNodes = this.graphNodes.filter(function (e) {
          return void 0 !== e;
        });
        this.graphEdges = this.graphEdges.filter(function (e) {
          return void 0 !== e;
        });
      }
      startMainNode(e, t) {
        console.log("startMainNode", e, t);
        let i = this.getRecipeToProduceItemId(e);
        "liquid" !== this.items[e].category && "gas" !== this.items[e].category || (t *= 1e3);
        if (null !== i) {
          "liquid" === this.items[e].category || "gas" === this.items[e].category ? this.postMessage({
            type: "updateLoaderText",
            text: "Calculating production of " + new Intl.NumberFormat(this.language).format(t / 1e3) + "m³ " + this.items[e].name + "..."
          }) : this.postMessage({
            type: "updateLoaderText",
            text: "Calculating production of " + new Intl.NumberFormat(this.language).format(t) + " " + this.items[e].name + "..."
          });
          let s = e + "_" + this.nodeIdKey;
          for (this.nodeIdKey++, this.graphNodes.push({
            data: {
              id: s,
              nodeType: "mainNode",
              itemId: e,
              qty: t,
              image: this.items[e].image
            }
          }); t > 0;) {
            let a = !1;
            for (let i = 0; i < this.graphNodes.length; i++) if ("byProductItem" === this.graphNodes[i].data.nodeType && this.graphNodes[i].data.itemId === e) {
              let d = this.graphNodes[i].data.qtyProduced - this.graphNodes[i].data.qtyUsed,
                r = Math.min(d, t);
              r < 0 && (r = d);
              d > 0 && r > 0 && (this.graphEdges.push({
                data: {
                  id: this.graphNodes[i].data.id + "_" + s,
                  source: this.graphNodes[i].data.id,
                  target: s,
                  itemId: e,
                  qty: r
                }
              }), this.graphNodes[i].data.qtyUsed += r, t -= r, a = !0);
            }
            if (!1 === a) {
              let a = this.buildCurrentNodeTree({
                id: e,
                recipe: i,
                qty: t,
                visId: s,
                level: 1
              });
              if (!1 === a) break;
              t -= a;
            }
          }
        }
      }
      buildCurrentNodeTree(e) {
        !0 === this.debug && console.log("buildCurrentNodeTree", e.qty, e.recipe, e.level);
        let t = this.getProductionBuildingFromRecipeId(e.recipe);
        if (null !== t) {
          let i = 4,
            s = 1,
            a = !1;
          this.nodeIdKey++;
          if (void 0 !== this.buildings[t].extractionRate) switch (i = 0.5, t) {
            case "Build_FrackingExtractor_C":
              "Recipe_CrudeOil_C" === e.recipe ? void 0 !== this.buildings[t].extractionRate[this.options.oilSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.oilSpeed]) : "Recipe_CrudeWater_C" === e.recipe ? void 0 !== this.buildings[t].extractionRate[this.options.waterSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.waterSpeed]) : void 0 !== this.buildings[t].extractionRate[this.options.gasSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.gasSpeed]);
              break;
            case "Build_OilPump_C":
              void 0 !== this.buildings[t].extractionRate[this.options.oilSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.oilSpeed]);
              break;
            case "Build_WaterPump_C":
              i = 60 / this.buildings[t].extractionRate.RP_Normal;
              break;
            default:
              void 0 !== this.buildings[t].extractionRate[this.options.oreSpeed] && (i = 60 / this.buildings[t].extractionRate[this.options.oreSpeed]);
          } else {
            void 0 !== this.recipes[e.recipe].ingredients && (a = this.recipes[e.recipe].ingredients);
            void 0 !== this.recipes[e.recipe].mManufactoringDuration && (i = this.recipes[e.recipe].mManufactoringDuration);
            void 0 !== this.recipes[e.recipe].mManualManufacturingMultiplier && "Build_Workshop_C" === t && (i *= this.recipes[e.recipe].mManualManufacturingMultiplier);
            if (void 0 !== this.recipes[e.recipe].produce) for (let t in this.recipes[e.recipe].produce) t === this.items[e.id].className && (s = this.recipes[e.recipe].produce[t]);
          }
          let d = t + "_" + this.nodeIdKey,
            r = 60 / i * s,
            o = Math.min(r, e.qty),
            h = Math.min(r, e.qty),
            l = 0,
            n = {
              id: d,
              nodeType: "productionBuilding",
              buildingType: t,
              recipe: e.recipe,
              itemOut: e.id,
              qtyProducedDefault: "Build_Workshop_C" === t ? 999999999 : r,
              qtyProduced: "Build_Workshop_C" === t ? 999999999 : r,
              qtyUsed: o,
              clockSpeed: 100,
              image: this.buildings[t].image
            };
          ["Build_SmelterMk1_C", "Build_ConstructorMk1_C"].includes(t) && (l = 1);
          ["Build_FoundryMk1_C", "Build_AssemblerMk1_C", "Build_OilRefinery_C", "Build_Converter_C"].includes(t) && (l = 2);
          ["Build_ManufacturerMk1_C", "Build_Blender_C", "Build_HadronCollider_C", "Build_QuantumEncoder_C"].includes(t) && (l = 4);
          if (this.options.availableSomerSloops > 0 && l > 0) for (; this.options.availableSomerSloops > 0 && (void 0 !== n.isProductionBoosted ? n.isProductionBoosted : 0) < l && e.qty > o;) {
            this.options.availableSomerSloops--;
            void 0 === n.isProductionBoosted && (n.isProductionBoosted = 0, n.qtyProducedBeforeBoost = n.qtyProduced);
            h += n.qtyProducedDefault * (1 / l);
            n.qtyProduced += n.qtyProducedDefault * (1 / l);
            n.isProductionBoosted++;
          }
          if (!1 !== a) {
            let e = !0;
            for (; !0 === e;) {
              e = !1;
              if (r > 0) for (let t in a) {
                let s = 60 / i * a[t] * o / r,
                  d = this.getItemIdFromClassName(t),
                  h = this.options.maxBeltSpeed;
                void 0 === this.items[d] || "liquid" !== this.items[d].category && "gas" !== this.items[d].category || (h = this.options.maxPipeSpeed);
                if (s > h) {
                  e = !0;
                  o--;
                  break;
                }
              }
            }
          }
          this.graphNodes.push({
            data: n
          });
          this.graphEdges.push({
            data: {
              id: d + "_" + e.visId,
              source: d,
              target: e.visId,
              itemId: e.id,
              recipe: e.recipe,
              qty: h
            }
          });
          this.buildings[t].supplementalLoadType;
          if (void 0 !== this.recipes[e.recipe].produce) for (let t in this.recipes[e.recipe].produce) if (t !== this.items[e.id].className) {
            let i = this.getItemIdFromClassName(t),
              a = o / s * this.recipes[e.recipe].produce[t],
              r = !1;
            for (let t = 0; t < this.graphNodes.length; t++) if ("byProductItem" === this.graphNodes[t].data.nodeType && this.graphNodes[t].data.itemId === i) {
              r = !0;
              this.graphNodes[t].data.qtyProduced += a;
              this.graphNodes[t].data.neededQty += a;
              this.graphEdges.push({
                data: {
                  id: d + "_" + this.graphNodes[t].data.id,
                  source: d,
                  target: this.graphNodes[t].data.id,
                  itemId: i,
                  recipe: e.recipe,
                  qty: a
                }
              });
              break;
            }
            !1 === r && (this.graphNodes.push({
              data: {
                id: e.visId + "_byProduct",
                nodeType: "byProductItem",
                itemId: i,
                qtyUsed: 0,
                qtyProduced: a,
                neededQty: a,
                image: this.items[i].image
              }
            }), this.graphEdges.push({
              data: {
                id: d + "_" + e.visId + "_byProduct",
                source: d,
                target: e.visId + "_byProduct",
                itemId: i,
                recipe: e.recipe,
                qty: a
              }
            }));
          }
          if (!1 !== a) for (let t in a) {
            let s = this.getItemIdFromClassName(t),
              h = 60 / i * a[t] * o / r;
            if (null !== this.options.maxLevel && this.options.maxLevel === e.level + 1 && "ore" !== this.items[s].category && "/Game/FactoryGame/Resource/RawResources/CrudeOil/Desc_LiquidOil.Desc_LiquidOil_C" !== s && "/Game/FactoryGame/Resource/RawResources/Water/Desc_Water.Desc_Water_C" !== s) {
              let e = !1;
              for (let t = 0; t < this.graphNodes.length; t++) if ("lastNodeItem" === this.graphNodes[t].data.nodeType && this.graphNodes[t].data.itemId === s) {
                e = !0;
                this.graphNodes[t].data.neededQty += h;
                this.graphEdges.push({
                  data: {
                    id: this.graphNodes[t].data.id + "_" + d,
                    source: this.graphNodes[t].data.id,
                    target: d,
                    itemId: s,
                    qty: h
                  }
                });
                break;
              }
              if (!1 === e) {
                let e = d + "_" + s;
                this.graphNodes.push({
                  data: {
                    id: e,
                    nodeType: "lastNodeItem",
                    itemId: s,
                    neededQty: h,
                    image: this.items[s].image
                  }
                });
                this.graphEdges.push({
                  data: {
                    id: e + "_" + d,
                    source: e,
                    target: d,
                    itemId: s,
                    qty: h
                  }
                });
              }
            } else {
              let t = this.getRecipeToProduceItemId(s);
              if (null !== t) for (; h > 0;) {
                let i = !1;
                for (let e = 0; e < this.graphNodes.length; e++) if ("byProductItem" === this.graphNodes[e].data.nodeType && this.graphNodes[e].data.itemId === s) {
                  let t = this.graphNodes[e].data.qtyProduced - this.graphNodes[e].data.qtyUsed,
                    a = Math.min(t, h);
                  a < 0 && (a = t);
                  if (t > 0 && a > 0) {
                    this.graphEdges.push({
                      data: {
                        id: this.graphNodes[e].data.id + "_" + d,
                        source: this.graphNodes[e].data.id,
                        target: d,
                        itemId: s,
                        qty: a
                      }
                    });
                    this.graphNodes[e].data.qtyUsed += a;
                    h -= a;
                    i = !0;
                    break;
                  }
                }
                if (!1 === i) {
                  let i = this.buildCurrentNodeTree({
                    id: s,
                    recipe: t,
                    qty: h,
                    visId: d,
                    level: e.level + 1
                  });
                  if (!1 === i) break;
                  h -= i;
                }
              } else {
                let e = !1;
                for (let t = 0; t < this.graphNodes.length; t++) if ("lastNodeItem" === this.graphNodes[t].data.nodeType && this.graphNodes[t].data.itemId === s) {
                  this.graphEdges.push({
                    data: {
                      id: this.graphNodes[t].data.id + "_" + d,
                      source: this.graphNodes[t].data.id,
                      target: d,
                      itemId: s,
                      qty: h
                    }
                  });
                  this.graphNodes[t].data.neededQty += h;
                  e = !0;
                  break;
                }
                if (!1 === e) {
                  let e = d + "_" + s;
                  this.graphNodes.push({
                    data: {
                      id: e,
                      nodeType: "lastNodeItem",
                      itemId: s,
                      neededQty: h,
                      image: this.items[s].image
                    }
                  });
                  this.graphEdges.push({
                    data: {
                      id: e + "_" + d,
                      source: e,
                      target: d,
                      itemId: s,
                      useAlternateRecipe: null,
                      qty: h
                    }
                  });
                }
              }
            }
          }
          return h;
        }
        return !1;
      }
      addLabels() {
        super.addLabels();
        let e = {};
        for (let t = 0; t < this.graphNodes.length; t++) {
          let i = this.graphNodes[t].data;
          if ("productionBuilding" === i.nodeType) {
            let s = i.qtyUsed / i.qtyProducedDefault * 100;
            this.graphNodes[t].data.label = this.buildings[i.buildingType].name + " (" + new Intl.NumberFormat(this.language).format(Math.round(s)) + "%)\n(" + this.recipes[this.graphNodes[t].data.recipe].name + ")";
            this.graphNodes[t].data.clockSpeed > 100 && (this.graphNodes[t].data.label += "\n(" + Math.round((this.graphNodes[t].data.clockSpeed - 100) / 50) + " power shards)", this.graphNodes[t].data.borderWidth = 15 * Math.round((this.graphNodes[t].data.clockSpeed - 100) / 50) + 15 + "px");
            void 0 === this.listBuildings[i.buildingType] && (this.listBuildings[i.buildingType] = 0);
            this.listBuildings[i.buildingType]++;
            void 0 !== i.isProductionBoosted && (this.graphNodes[t].data.label += "\n(x" + i.isProductionBoosted + " somersloop)", this.graphNodes[t].data.font = {
              color: "rgb(166, 113, 166)"
            }, this.graphNodes[t].data.backgroundColor = "rgb(166, 113, 166)");
            let a = 0;
            "Build_FrackingExtractor_C" === i.buildingType ? (void 0 === e[i.recipe] && (e[i.recipe] = 0), e[i.recipe]++) : (void 0 !== this.buildings[i.buildingType].powerUsed && (a = this.buildings[i.buildingType].powerUsed), void 0 !== this.buildings[i.buildingType].powerUsedRecipes && void 0 !== this.buildings[i.buildingType].powerUsedRecipes[i.recipe] && (a = (this.buildings[i.buildingType].powerUsedRecipes[i.recipe][0] + this.buildings[i.buildingType].powerUsedRecipes[i.recipe][1]) / 2), this.requiredPower += a * Math.pow(s / 100, 1.321929));
          }
        }
        for (let t in e) this.requiredPower += Math.ceil(e[t] / 6) * this.buildings.Build_FrackingSmasher_C.powerUsed;
      }
      testEdgesMaxSpeeds(e, t, i) {
        let s = {};
        for (let a = 0; a < this.graphEdges.length; a++) if (void 0 !== this.graphEdges[a] && (this.graphEdges[a].data.target === e.id || this.graphEdges[a].data.target === t.id)) {
          void 0 === s[this.graphEdges[a].data.itemId] && (s[this.graphEdges[a].data.itemId] = 0);
          s[this.graphEdges[a].data.itemId] += this.graphEdges[a].data.qty * (i / 100);
          let e = this.options.maxBeltSpeed;
          "liquid" !== this.items[this.graphEdges[a].data.itemId].category && "gas" !== this.items[this.graphEdges[a].data.itemId].category || (e = this.options.maxPipeSpeed);
          if (s[this.graphEdges[a].data.itemId] > e) return !1;
        }
        return !0;
      }
    }
    window.SCPP = new class SCPP {
      constructor() {
        this.baseUrls = {};
        this.doUpdateUrl = !0;
        this.debug = !1;
        this.language = "en";
        this.translate = {};
        this.productionContainer = $("#productionContainer");
        this.staticAssetsUrl = "https://static.satisfactory-calculator.com";
        this.gameDataUrl = "https://satisfactory-calculator.com/" + this.language + "/api/game";
        this.scriptsVERSION = Math.floor(Math.random() * Math.floor(999));
        this.urlScriptsVERSION = null;
        this.intervalScriptsVERSION = null;
        this.collectedSchematics = new Schematics({
          language: this.language
        });
        this.activatedMods = [];
        this.availableWorkers = {
          SIMPLE: {
            name: "Solver_Simple",
            class: Solver_Simple
          },
          REALISTIC: {
            name: "Solver_Realistic",
            class: Solver_Realistic
          }
        };
      }
      start() {
        null !== this.urlScriptsVERSION && (this.intervalScriptsVERSION = setInterval(this.checkVersion.bind(this), 3e5));
        $.getJSON(this.gameDataUrl + "?v=" + this.scriptsVERSION, function (e) {
          this.buildingsData = e.buildingsData;
          this.itemsData = Object.assign(e.toolsData, e.itemsData);
          this.recipesData = e.recipesData;
          if (this.activatedMods.length > 0) for (let e = 0; e < this.activatedMods.length; e++) {
            let t = this.activatedMods[e];
            for (let e in t.buildings) this.buildingsData[e] = t.buildings[e];
            for (let e in t.items) this.itemsData[e] = t.items[e];
            for (let e in t.tools) this.itemsData[e] = t.tools[e];
            for (let e in t.recipes) this.recipesData[e] = t.recipes[e];
          }
          this.initiateGraph();
        }.bind(this));
      }
      initiateGraph() {
        this.graphLayout = null;
        this.graph = cytoscape({
          container: document.getElementById("productionNetwork"),
          wheelSensitivity: 0.05,
          layout: void 0,
          elements: {
            nodes: {},
            edges: {}
          },
          style: [{
            selector: "node",
            style: {
              padding: "64px",
              width: "384px",
              height: "384px"
            }
          }, {
            selector: 'node[nodeType="merger"], node[nodeType="splitter"]',
            style: {
              padding: "32px",
              width: "128px",
              height: "128px"
            }
          }, {
            selector: "node[image]",
            style: {
              shape: "square",
              "background-fit": "contain",
              "background-image": "data(image)",
              "background-opacity": 0
            }
          }, {
            selector: "node[backgroundColor]",
            style: {
              "background-opacity": 1,
              "background-color": "data(backgroundColor)"
            }
          }, {
            selector: "node[performance]",
            style: {
              shape: "ellipse",
              "background-fit": "none",
              "background-width": "75%",
              "background-height": "75%",
              "border-width": "data(borderWidth)"
            }
          }, {
            selector: "node[performanceColor]",
            style: {
              "border-color": "data(performanceColor)"
            }
          }, {
            selector: "node[wasClicked]",
            style: {
              "background-color": "#00FF00",
              "background-opacity": 1
            }
          }, {
            selector: "node[label]",
            style: {
              "text-margin-y": "20px",
              label: "data(label)",
              "text-valign": "bottom",
              "font-size": "64px;",
              "text-wrap": "wrap",
              color: "#FFFFFF"
            }
          }, {
            selector: "edge",
            style: {
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
              "line-color": "#2b7ce9",
              "target-arrow-color": "#2b7ce9",
              opacity: 1,
              width: "15px"
            }
          }, {
            selector: "edge[color]",
            style: {
              "line-color": "data(color)",
              "target-arrow-color": "data(color)"
            }
          }, {
            selector: "edge[label]",
            style: {
              "text-margin-y": "-30px",
              "text-rotation": "autorotate",
              label: "data(label)",
              "font-size": "36px;",
              color: "#FFFFFF"
            }
          }]
        });
        return this.setupEvents();
      }
      setupEvents() {
        $("#outputSearch, #inputSearch").on("focusin", function () {
          $(this).data("val", $(this).val());
        }).on("keyup mouseup", function (e) {
          if ($(e.currentTarget).data("val") !== $(e.currentTarget).val() || "" === $(e.currentTarget).val()) {
            let t = $(e.currentTarget).val().toLowerCase();
            $(e.currentTarget).parent().next(".modal-body").find("[data-search=1]").each(function () {
              $(this).find("h6 strong").text().toLowerCase().includes(t) ? $(this).removeClass("d-none").addClass("d-flex") : $(this).addClass("d-none").removeClass("d-flex");
              0 === $(this).parent().find(".d-flex").length ? $(this).parent().prev(".row").addClass("d-none") : $(this).parent().prev(".row").removeClass("d-none");
            });
          }
        }.bind(this));
        $("#chooseItemOutput, #chooseItemInput").on("show.bs.modal", function () {
          $("#outputSearch, #inputSearch").data("val", "").val("");
          $(this).find(".row").removeClass("d-none");
          $(this).find("[data-search=1]").each(function () {
            $(this).removeClass("d-none").addClass("d-flex");
          });
          $(this).find("img").each(function () {
            let e = $(this).attr("data-src");
            if (void 0 !== e) {
              const t = new Image();
              t.src = e;
              t.onload = () => {
                $(this).attr("src", e).removeAttr("data-src");
              };
            }
          });
        });
        $(".addOneItem").on("click", function (e) {
          let t = $(e.currentTarget).attr("data-id"),
            i = $(e.currentTarget).attr("data-type"),
            s = $("input.requireInput[data-id=" + t + "][data-type=" + i + "]");
          e.preventDefault();
          $(e.currentTarget).addClass("d-none").removeClass("d-flex").attr("data-search", 0);
          s.closest(".media").find(".stepBackward").removeClass("disabled");
          s.val(1).closest(".media").addClass("d-flex").removeClass("d-none").find("img").each(function () {
            let e = $(this).attr("data-src");
            if (void 0 !== e) {
              const t = new Image();
              t.src = e;
              t.onload = () => {
                $(this).attr("src", e).removeAttr("data-src");
              };
            }
          });
          $("#chooseItemInput").modal("hide");
          $("#chooseItemOutput").modal("hide");
          this.triggerUpdateDebounce();
        }.bind(this));
        $(".stepUpdate").on("click", function (e) {
          e.preventDefault();
          let t = $(e.currentTarget).parent().parent(),
            i = t.find("input"),
            s = parseInt($(e.currentTarget).attr("data-value")),
            a = parseFloat(i.val()) + s;
          a >= 0 && (0 === a && (t.closest(".media").addClass("d-none").removeClass("d-flex"), $(".addOneItem[data-id=" + i.attr("data-id") + "]").addClass("d-flex").removeClass("d-none").attr("data-search", 1)), i.val(a), this.triggerUpdateDebounce());
          t.find(".stepUpdate").removeClass("disabled");
          a - 10 < 0 && t.find(".fastBackward").addClass("disabled");
          a - 1 < 0 && t.find(".stepBackward").addClass("disabled");
        }.bind(this));
        $("input.requireInput").on("focusin", function () {
          $(this).data("val", $(this).val());
        }).on("keyup mouseup", function (e) {
          $(e.currentTarget).data("val") !== $(e.currentTarget).val() && this.triggerUpdateDebounce(e.currentTarget);
        }.bind(this));
        $("select.requireInput").on("change", function (e) {
          this.triggerUpdateDebounce();
        }.bind(this));
        $('select[name="altRecipes[]"]').on("changed.bs.select", function (e, t, i, s) {
          let a = $(this).find("option:eq(" + t + ")").attr("value");
          if (Array.isArray(s)) {
            let e = $('select[name="altRecipes[]"]:not(#mainAltRecipe) option[value="' + a + '"]'),
              t = e.parent();
            e.prop("selected", i);
            t.selectpicker("refresh");
          } else {
            1 === $('select[name="altRecipes[]"]:not(#mainAltRecipe) option[value="' + a + '"]').attr("data-converter") ? ($('#mainConvRecipe option[value="' + s + '"]').prop("selected", !1), $('#mainConvRecipe option[value="' + a + '"]').prop("selected", !0), $("#mainConvRecipe").selectpicker("refresh")) : ($('#mainAltRecipe option[value="' + s + '"]').prop("selected", !1), $('#mainAltRecipe option[value="' + a + '"]').prop("selected", !0), $("#mainAltRecipe").selectpicker("refresh"));
          }
        });
        $('select[name="view"]').on("change", function () {
          let e = $(this).val();
          $('div[data-view][data-view!="' + e + '"]').hide();
          $('div[data-view="' + e + '"]').show();
        });
        $('select[name="mergeBuildings"]').on("change", function () {
          $(this).val() > 0 ? $("div[data-mergeBuildings]").show() : $("div[data-mergeBuildings]").hide();
        });
        $('input[name="powerShards"]').on("keyup change input", function (e) {
          parseInt($(e.currentTarget).val()) > 0 ? $("div[data-powerShards]").show() : $("div[data-powerShards]").hide();
          this.triggerUpdateDebounce();
        }.bind(this));
        this.collectedSchematics.getCollectedSchematics().length > 0 && $("#loadAltRecipeFromSCIM").show().find("button").on("click", function (e) {
          $("#mainAltRecipe").selectpicker("deselectAll");
          let t = this.collectedSchematics.getCollectedSchematics();
          for (let e = 0; e < t.length; e++) {
            let i = $("#mainAltRecipe").find('option[data-schematic="' + t[e] + '"');
            i.length > 0 && i.each(function () {
              $('#mainAltRecipe option[value="' + $(this).val() + '"]').prop("selected", !0);
            });
          }
          $("#mainAltRecipe").selectpicker("refresh");
          this.triggerUpdateDebounce();
        }.bind(this));
        return this.updateRequired(!0);
      }
      triggerUpdateDebounce(e = null) {
        this.inputTimeout && clearTimeout(this.inputTimeout);
        this.inputTimeout = setTimeout(function () {
          null !== e && 0 === parseFloat($(e).val()) && (this.timeoutID = void 0, $(e).closest(".media").addClass("d-none").removeClass("d-flex"), $(".addOneItem[data-id=" + $(e).attr("data-id") + "][data-type=" + $(e).attr("data-type") + "]").addClass("d-flex").removeClass("d-none").attr("data-search", 1));
          this.updateRequired();
          this.inputTimeout = null;
        }.bind(this), 500);
      }
      updateRequired(e = !1) {
        let t = !1,
          i = [];
        if (this.activatedMods.length > 0) for (let e = 0; e < this.activatedMods.length; e++) i.push(this.activatedMods[e].data.idSML);
        let s = {};
        $(".requireInput").each(function () {
          if ($(this).is("select")) {
            if (["mergeBuildings", "useManifolds", "minerOverclocking", "pumpOverclocking", "buildingOverclocking"].includes($(this).attr("name"))) 1 !== parseInt($(this).children("option:selected").val()) && (s[$(this).attr("name")] = $(this).val());else if ("" !== $(this).children("option:selected").val()) {
              switch ($(this).attr("name")) {
                case "altRecipes[]":
                  let e = !1,
                    a = "mainAltRecipe" === $(this).attr("id");
                  if (!1 === a) {
                    !1 === $(this).closest(".media").hasClass("d-none") && (e = !0);
                  }
                  if (!0 === a || !0 === e) {
                    let e = $(this).attr("name").replace("[]", "");
                    void 0 === s[e] && (s[e] = []);
                    $.each($(this).children("option"), function (t, i) {
                      let d = $(this).val();
                      !0 === $(this).is(":selected") && (!0 === a || t > 0) && !1 === s[e].includes(d) && s[e].push(d);
                    });
                  }
                  break;
                case "convRecipes[]":
                  let d = $(this).attr("name").replace("[]", "");
                  void 0 === s[d] && (s[d] = []);
                  $.each($(this).children("option"), function (e, t) {
                    let i = $(this).val();
                    !0 === $(this).is(":selected") && !1 === s[d].includes(i) && s[d].push(i);
                  });
                  break;
                case "mods[]":
                  $.each($(this).children("option"), function (e, a) {
                    let d = $(this).val();
                    !0 === $(this).is(":selected") ? (void 0 === s.mods && (s.mods = []), s.mods.push(d), (0 === i.length || i.length > 0 && !1 === i.includes(d)) && (t = !0)) : i.length > 0 && !0 === i.includes(d) && (t = !0);
                  });
                  break;
                default:
                  s[$(this).attr("name").replace("[]", "")] = $(this).children("option:selected").val();
              }
            }
          } else $(this).val() > 0 && (void 0 !== $(this).attr("data-id") && void 0 !== $(this).attr("data-type") ? ("output" === $(this).attr("data-type") && (s[$(this).attr("data-id")] = $(this).val()), "input" === $(this).attr("data-type") && (void 0 === s.input && (s.input = {}), s.input[$(this).attr("data-id")] = $(this).val())) : s[$(this).attr("name")] = $(this).val());
        }).promise().done(function () {
          this.activatedMods.length > 0 && (s.activatedMods = this.activatedMods);
          this.calculate(s, e, t);
        }.bind(this));
      }
      reset() {
        this.graph.elements().remove();
        this.graph.off("tap", "node");
        this.terminateWorker();
        $("#productionList").empty();
        $("#itemsList").empty();
        $("#buildingsList").empty();
        $("#requiredPower").empty();
        this.hideLoader();
      }
      terminateWorker() {
        void 0 !== this.worker && null !== this.worker && (this.worker.terminate(), this.worker = null);
      }
      calculate(t, i, s = !1) {
        this.reset();
        let a = new Blob([Worker_Wrapper.toString(), ";", this.availableWorkers[t.view].class.toString(), ";", "(", e.toString(), ")(" + this.availableWorkers[t.view].name + ");"], {
            type: "application/javascript"
          }),
          d = URL.createObjectURL(a);
        this.worker = new Worker(d);
        setTimeout(function () {
          URL.revokeObjectURL(d);
        }, 1500);
        this.worker.onmessage = function (e) {
          switch (e.data.type) {
            case "showLoader":
              return this.showLoader();
            case "updateLoaderText":
              return this.updateLoaderText(e.data.text);
            case "updateUrl":
              if (!0 === s) location.href = this.baseUrls.planner + "/json/" + encodeURI(JSON.stringify(e.data.url));else if (!1 === i && !1 !== this.doUpdateUrl) return this.updateUrl(e.data.url);
              return;
            case "updateGraphNetwork":
              return !1 === s ? this.updateGraphNetwork(e.data.nodes, e.data.edges, t.direction) : void 0;
            case "updateRequiredPower":
              return void $("#requiredPower").html(new Intl.NumberFormat(this.language).format(Math.ceil(e.data.power)) + " MW");
            case "updateTreeList":
            case "updateItemsList":
            case "updateBuildingsList":
              return this[e.data.type](e.data.data);
            case "addAlternateRecipe":
              $('#mainAltRecipe option[value="' + e.data.recipeId + '"]').prop("selected", !0);
              $("#mainAltRecipe").selectpicker("refresh");
              return void this.triggerUpdateDebounce();
            case "removeAlternateRecipe":
              $('#mainAltRecipe option[value="' + e.data.recipeId + '"]').prop("selected", !1);
              $("#mainAltRecipe").selectpicker("refresh");
              return void this.triggerUpdateDebounce();
            case "done":
              return this.terminateWorker();
          }
          console.log("onmessage received:", e.data);
        }.bind(this);
        this.worker.postMessage({
          baseUrls: this.baseUrls,
          debug: this.debug,
          language: this.language,
          translate: this.translate,
          buildings: this.buildingsData,
          items: this.itemsData,
          recipes: this.recipesData,
          formData: t
        });
      }
      updateGraphNetwork(e, t, i = "RIGHT") {
        null !== this.graphLayout && this.graphLayout.stop();
        const data = {
          elements: {
            nodes: e,
            edges: t
          }
        };
        console.log(data);
        this.graph.json({
          elements: {
            nodes: e,
            edges: t
          }
        });
        let s = {
          name: "elk",
          nodeDimensionsIncludeLabels: !0,
          fit: !0,
          ranker: "longest-path",
          elk: {
            "elk.layered.spacing.nodeNodeBetweenLayers": 768,
            "elk.layered.spacing.nodeNode": 512,
            "elk.direction": i,
            "elk.algorithm": "layered",
            "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
            "elk.edgeRouting": "ORTHOGONAL",
            spacing: 512,
            inLayerSpacingFactor: 50,
            layoutHierarchy: !0,
            intCoordinates: !0,
            zoomToFit: !0,
            separateConnectedComponents: !1
          }
        };
        this.graphLayout = this.graph.layout(s);
        this.graphLayout.on("layoutstop", function () {
          this.hideLoader();
        }.bind(this));
        this.graphLayout.run();
        this.graph.on("tap", "node", function (e) {
          "mainNode" !== this.data("nodeType") && (void 0 === this.data("wasClicked") ? this.data("wasClicked", !0) : this.removeData("wasClicked"));
        });
      }
      updateTreeList(e) {
        $("#productionList").empty().html(e);
        $("#productionList .collapseChildren").css("cursor", "pointer").bind("click", function () {
          let e = $(this).parent().next(".parent");
          e.is(":hidden") ? e.show() : e.hide();
        });
      }
      updateItemsList(e) {
        console.log("itemsList", e);
        this.updateLoaderText("Generating items list...");
        let t = [],
          i = Object.keys(e).sort((t, i) => e[i] - e[t]);
        if (0 === i.length) t.push('<p class="p-3 text-center">Please select at least one item in the production list.</p>');else {
          t.push('<table class="table table-striped mb-0">');
          t.push("<thead>");
          t.push("<tr>");
          t.push("<th></th>");
          t.push("<th>Needed per minute</th>");
          t.push("</tr>");
          t.push("</thead>");
          t.push("<tbody>");
          for (let s = 0; s < i.length; s++) {
            let a = i[s];
            t.push("<tr>");
            t.push('<td width="40"><img src="' + this.itemsData[a].image + '" style="width: 40px;" /></td>');
            t.push('<td class="align-middle">');
            "liquid" === this.itemsData[a].category || "gas" === this.itemsData[a].category ? t.push(new Intl.NumberFormat(this.language).format(e[a]) + " m³/min of ") : t.push(new Intl.NumberFormat(this.language).format(e[a]) + " units/min of ");
            void 0 !== this.itemsData[a].url ? t.push('<a href="' + this.itemsData[a].url + '">' + this.itemsData[a].name + "</a>") : t.push('<a href="' + this.baseUrls.items + "/id/" + a + "/name/" + this.itemsData[a].name + '">' + this.itemsData[a].name + "</a>");
            t.push("</td>");
            t.push("</tr>");
          }
          t.push("</tbody>");
          t.push("</table>");
        }
        $("#itemsList").html(t.join(""));
      }
      updateBuildingsList(e) {
        this.updateLoaderText("Generating buildings list...");
        let t = [],
          i = {},
          s = Object.keys(e).sort((t, i) => e[i] - e[t]);
        if (0 === s.length) t.push('<p class="p-3 text-center">Please select at least one item in the production list.</p>');else {
          t.push('<table class="table table-striped mb-0">');
          for (let a = 0; a < s.length; a++) {
            let d = s[a],
              r = null,
              o = this.buildingsData[d].className.replace(/Build_/g, "Desc_");
            for (let e in this.recipesData) if (void 0 !== this.recipesData[e].produce[o]) {
              r = [];
              for (let t in this.recipesData[e].ingredients) for (let i in this.itemsData) if (this.itemsData[i].className === t) {
                r.push({
                  id: i,
                  name: this.itemsData[i].name,
                  image: this.itemsData[i].image,
                  qty: this.recipesData[e].ingredients[t]
                });
                break;
              }
              break;
            }
            t.push("<tr>");
            t.push('<td width="40" class="align-middle"><img src="' + this.buildingsData[d].image + '" style="width: 40px;" /></td>');
            t.push('<td class="align-middle">');
            t.push(new Intl.NumberFormat(this.language).format(e[d]) + "x ");
            void 0 !== this.buildingsData[d].url ? t.push('<a href="' + this.buildingsData[d].url + '">' + this.buildingsData[d].name + "</a>") : t.push('<a href="' + this.baseUrls.buildings + "/id/" + d + "/name/" + this.buildingsData[d].name + '">' + this.buildingsData[d].name + "</a>");
            t.push("</td>");
            t.push('<td class="align-middle">');
            let h = [];
            if (null !== r) for (let t = 0; t < r.length; t++) {
              let s = e[d] * r[t].qty,
                a = [];
              a.push(new Intl.NumberFormat(this.language).format(s) + "x ");
              a.push('<img src="' + r[t].image + '" title="' + r[t].name + '" style="width: 24px;" />');
              void 0 === i[r[t].id] ? i[r[t].id] = s : i[r[t].id] += s;
              h.push(a.join(""));
            }
            t.push(h.join(", "));
            t.push("</td>");
            t.push("</tr>");
          }
          t.push("<tr>");
          t.push('<td width="50"></td>');
          t.push("<td><strong>Total:</strong></td>");
          t.push('<td class="p-0"><ul class="list-group list-group-flush">');
          let a = Object.keys(i).sort((e, t) => i[t] - i[e]);
          for (let e = 0; e < a.length; e++) {
            let s = a[e];
            t.push('<li class="list-group-item">');
            t.push(new Intl.NumberFormat(this.language).format(i[s]) + "x ");
            void 0 !== this.itemsData[s] ? (t.push('<img src="' + this.itemsData[s].image + '" title="' + this.itemsData[s].name + '" style="width: 24px;" /> '), void 0 !== this.itemsData[s].url ? t.push('<a href="' + this.itemsData[s].url + '">' + this.itemsData[s].name + "</a>") : t.push('<a href="' + this.baseUrls.items + "/id/" + s + "/name/" + this.itemsData[s].name + '">' + this.itemsData[s].name + "</a>")) : t.push(s);
            t.push("</li>");
          }
          t.push("</ul></td>");
          t.push("</tr>");
          t.push("</table>");
        }
        $("#buildingsList").html(t.join(""));
      }
      hideLoader() {
        this.productionContainer.find(".loader").hide();
      }
      showLoader() {
        this.productionContainer.find(".loader").show();
      }
      updateLoaderText(e) {
        this.productionContainer.find(".loader h6").html(e);
      }
      updateUrl(e) {
        let t = this.baseUrls.planner;
        t += "/json/" + encodeURIComponent(JSON.stringify(e));
        window.history.pushState({
          href: t
        }, "", t);
        "function" == typeof gtag && gtag("event", "page_view", {
          page_path: t
        });
      }
      checkVersion(e) {
        if (null != e) {
          if (e > this.scriptsVERSION) {
            $.fn.modal ? $("#newPlannerRelease").modal({
              backdrop: "static",
              keyboard: !1
            }) : alert("Good news, a new version of the production planner was released! Please refresh your page / browser cache to make sure you'll get the latest fixes and features.");
            return !1;
          }
        } else null !== this.urlScriptsVERSION && $.get(this.urlScriptsVERSION, function (e) {
          if (e > this.scriptsVERSION) {
            $.fn.modal ? $("#newPlannerRelease").modal({
              backdrop: "static",
              keyboard: !1
            }) : alert("Good news, a new version of the production planner was released! Please refresh your page / browser cache to make sure you'll get the latest fixes and features.");
            clearInterval(this.intervalScriptsVERSION);
            return !1;
          }
        });
        return !0;
      }
    }();
  })();
})();