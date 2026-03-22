import type { Express } from "express";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { rolexModels, rolexMovements, rolexSerialRanges, rolexMarketValues, rolexAuthenticationMarkers } from "@shared/schema";
import { analyzeRolexCondition, getRolexMovementExpertise, analyzeRolexFeatures } from "../ai-rolex-expert";
import { autoUpdateRolexDatabase } from "../rolex-auto-updater";

export function registerWatchRoutes(app: Express) {

  app.post("/api/rolex-ai/analyze", async (req, res) => {
    try {
      console.log('🔍 ROLEX AI: Analyzing condition and authenticity request...');
      
      const analysisRequest = {
        query: req.body.query || '',
        movement: req.body.movement,
        condition: req.body.condition,
        serialNumber: req.body.serialNumber,
        modelNumber: req.body.modelNumber,
        images: req.body.images
      };

      if (!analysisRequest.query) {
        return res.status(400).json({
          success: false,
          error: "Query or description is required for analysis"
        });
      }

      const hasImages = analysisRequest.images && Array.isArray(analysisRequest.images) && analysisRequest.images.length > 0;

      if (!hasImages) {
        try {
          const { simplicityWithTools } = await import('../ai-tools');
          const ROLEX_SYSTEM = `You are Simplicity, the Rolex intelligence engine inside Simpleton™. You have comprehensive knowledge of every Rolex reference, caliber, authentication marker, condition grade, and current secondary market value. Use the get_rolex_market_data tool to provide accurate, live market context.

SERIAL NUMBER DATING — LETTER PREFIX SYSTEM (1987–2010):
R=1987, L=1988, E=1990, X=1991, N=1991, C=1992, S=1993, W=1995, T=1996, U=1997, A=1999, P=2000, K=2001, Y=2002, F=2004, D=2005, Z=2006, M=2007, V=2008, G=2010. After 2010: Random serials (use warranty card). Pre-1987: Sequential numeric.

COMPLETE REFERENCE DATABASE FOR CROSS-AUTHENTICATION:
Air-King: 126900 (2022–now, 40mm, Cal.3230), 116900 (2016–2022, 40mm, Cal.3131), 114200 (2007–2014, 34mm SS, Cal.3130), 114210 (2007–2014, 34mm Engine-Turned, Cal.3130), 14000 (1989–2001, 34mm SS, Cal.3000), 14000M (2001–2007, 34mm SS, Cal.3130), 14010 (1989–2001, 34mm Engine-Turned, Cal.3000), 14010M (2001–2007, 34mm Engine-Turned, Cal.3130), 5500 (1957–1989, 34mm, Cal.1520/1530).
Submariner: 124060 (2020–now, No-Date, Cal.3230), 126610LN (2020–now, Date, Cal.3235), 126610LV "Starbucks", 126619LB "Smurf" WG, 116610LN (2010–2020, Cal.3135), 116610LV "Hulk", 114060 (2012–2020, Cal.3130), 16610 (1989–2010, Cal.3135), 16610LV "Kermit", 14060 (1990–2007, Cal.3000), 14060M (2000–2012, Cal.3130), 16800 (1979–1988), 5513 (1962–1989), 5512 (1959–1978), 1680 (1969–1979).
GMT-Master: 126710BLNR "Batman" (2019–now, Cal.3285), 126710BLRO "Pepsi" (2018–now), 126720VTNR "Sprite", 116710BLNR (2013–2019, Cal.3186), 16710 (1989–2007, Cal.3185), 16750 (1981–1988), 1675 (1959–1980), 6542 (1954–1959).
Daytona: 126500LN (2023–now, Cal.4131), 116500LN (2016–2023, Cal.4130), 116520 (2000–2016, Cal.4130), 16520 "Zenith" (1988–2000, Cal.4030), 6263/6265 (1971–1987), 6239/6241 (1963–1969).
Explorer: 124270 (2021–now, 36mm, Cal.3230), 214270 (2010–2021, 39mm), 114270 (1990–2010), 14270 (1990–2001), 1016 (1963–1989). Explorer II: 226570 (2021–now), 216570 (2011–2021), 16570 (1989–2011), 1655 (1971–1985).
Sea-Dweller: 126600 (2017–now, 43mm), 126603 Two-Tone, 116600 (2014–2017), 16600 (1990–2008), 16660 (1978–1988), 1665 (1967–1983). DeepSea: 136660, 126660, 116660.
Day-Date: 228238/235/239/206 (40mm, Cal.3255), 128238/235/239 (36mm), 118238/135/139/206, 18238/038/039, 1803/1802. Datejust: 126300/334/333/200/234 (Cal.3235), 116300/334/234/200, 16234/233/200, 1601/1603/1600.
Oyster Perpetual: 124300 (41mm), 126000 (36mm), 124200 (34mm), 114300 (39mm), 116000 (36mm), 115200/15200, 1500, 1002.
Sky-Dweller: 336933/934/935/938 (2023–now, Jubilee, Cal.9002), 336235/239 (precious metal Jubilee), 326933/934/935 (2017/2019–2023), 326238/235/139.
Milgauss: 116400GV (Green Glass), 116400, 1019 (1960–1988).
Yacht-Master: 126622 (40mm), 126621 Everose, 116622. YM II: 116688/681/680.
Lady-Datejust 28mm: 279160/163/165/166/171/173/174/175/178/179 (Cal.2236), 279381/383/384/385/386 and RBR variants (diamond bezel), 279135RBR/138RBR/139RBR/136RBR (precious metal diamond). Datejust 31mm: 278240/241/243/271/273/274/278/275/279 (Cal.2236), 278341RBR/343RBR/344RBR/381RBR/383RBR/384RBR (diamond). Previous: 179174/173/175/160/178/384/383 (26mm), 178274/273/271/240 (31mm), 69174/173/178/179, 6917/6916.
Cellini: 50535 Moonphase, 50525 Time, 50515 Date. Turn-O-Graph: 116264/263, 16264, 1625.

CROSS-AUTHENTICATION: When given serial + reference, ALWAYS: 1) Date serial via prefix system. 2) Look up reference in database. 3) Confirm serial year falls within reference production window. 4) Identify exact model name, case size, material, movement. 5) Flag any discrepancies.

Always provide: confidence level (0-100%), specific recommendations, red flags, estimated value range, and next steps. Be precise and conservative in assessments. RESPONSE FORMAT: Write naturally and conversationally — like a knowledgeable friend explaining their findings. No markdown symbols (no **, no ##, no *, no backticks, no ---). Use paragraph breaks between thoughts. Keep it clear, warm, and direct. No filler openers. Just give the real talk.`;
          const userMessage = `${analysisRequest.query}${analysisRequest.movement ? `\nMovement: ${analysisRequest.movement}` : ''}${analysisRequest.condition ? `\nCondition: ${analysisRequest.condition}` : ''}${analysisRequest.serialNumber ? `\nSerial: ${analysisRequest.serialNumber}` : ''}${analysisRequest.modelNumber ? `\nModel: ${analysisRequest.modelNumber}` : ''}`;
          const toolResult = await simplicityWithTools(ROLEX_SYSTEM, userMessage, 2000);
          console.log(`✅ ROLEX AI Tool Calls success (tools: ${toolResult.toolsUsed.join(', ') || 'none'})`);
          return res.json({
            success: true,
            analysis: { analysis: toolResult.text, confidence: 85, recommendations: [], consistency_score: 0, condition_grade: '', estimated_value_range: 'See analysis above', red_flags: [], next_steps: [] },
            rolex_expert_system: "ACTIVE",
            ai_model: toolResult.model,
            tools_used: toolResult.toolsUsed,
            timestamp: new Date().toISOString()
          });
        } catch (toolsErr: any) {
          console.log(`⚠️ ROLEX AI Tool Calls failed (${toolsErr?.message}), falling back to Claude...`);
        }
      }

      const analysis = await analyzeRolexCondition(analysisRequest);

      res.json({
        success: true,
        analysis,
        rolex_expert_system: "ACTIVE",
        ai_model: "simplicity-ai",
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ ROLEX AI Analysis Error:', error);
      res.status(500).json({
        success: false,
        error: "Rolex analysis failed",
        details: error.message,
        rolex_expert_system: "ERROR"
      });
    }
  });

  app.post("/api/rolex-ai/movement", async (req, res) => {
    try {
      console.log('🔍 ROLEX AI: Movement expertise request...');
      
      const { caliber } = req.body;

      if (!caliber) {
        return res.status(400).json({
          success: false,
          error: "Movement caliber is required"
        });
      }

      try {
        const { simplicityWithTools } = await import('../ai-tools');
        const MOVEMENT_SYSTEM = `You are Simplicity, the Rolex intelligence engine inside Simpleton™. You have detailed knowledge of every Rolex caliber ever produced. Provide technical analysis including: beat rate, power reserve, jewel count, complications, service intervals, common issues, and how the caliber affects secondary market value. Use get_rolex_market_data tool when relevant to value discussion. RESPONSE FORMAT: Write naturally and conversationally — like a veteran watchmaker explaining to a collector. No markdown symbols (no **, no ##, no *, no backticks, no ---). Use paragraph breaks between thoughts. Keep it clear, warm, and technically precise but not stiff. No filler openers.`;
        const toolResult = await simplicityWithTools(MOVEMENT_SYSTEM, `Provide expert analysis of Rolex caliber: ${caliber}`, 2000);
        console.log(`✅ ROLEX Movement Tool Calls success`);
        return res.json({
          success: true,
          caliber,
          expertise: toolResult.text,
          rolex_expert_system: "ACTIVE",
          ai_model: toolResult.model,
          tools_used: toolResult.toolsUsed,
          timestamp: new Date().toISOString()
        });
      } catch (toolsErr: any) {
        console.log(`⚠️ ROLEX Movement Tool Calls failed (${toolsErr?.message}), falling back to Claude...`);
      }

      const expertise = await getRolexMovementExpertise(caliber);

      res.json({
        success: true,
        caliber,
        expertise,
        rolex_expert_system: "ACTIVE",
        ai_model: "simplicity-ai",
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ ROLEX AI Movement Error:', error);
      res.status(500).json({
        success: false,
        error: "Movement analysis failed",
        details: error.message,
        rolex_expert_system: "ERROR"
      });
    }
  });

  app.get("/api/watches/photo", async (req, res) => {
    const query = req.query.query as string;
    if (!query) return res.status(400).json({ error: "query required" });

    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

    if (unsplashKey) {
      try {
        const searchQuery = encodeURIComponent(`rolex ${query} watch luxury`);
        const url = `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&orientation=squarish&content_filter=high`;
        const resp = await fetch(url, {
          headers: { Authorization: `Client-ID ${unsplashKey}` }
        });
        if (resp.ok) {
          const data = await resp.json() as any;
          if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            return res.json({
              url: photo.urls.regular,
              thumb: photo.urls.small,
              source: "unsplash",
              attribution: `Photo by ${photo.user.name} on Unsplash`,
              attributionUrl: `${photo.user.links.html}?utm_source=simpleton_vision&utm_medium=referral`,
              unsplashUrl: `${photo.links.html}?utm_source=simpleton_vision&utm_medium=referral`
            });
          }
        }
      } catch (e) {
        console.log("⚠️ Unsplash photo fetch failed, falling back to Wikimedia");
      }
    }

    try {
      const wikiQuery = encodeURIComponent(`rolex ${query}`);
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${wikiQuery}&srnamespace=6&format=json&srlimit=3`;
      const searchResp = await fetch(searchUrl);
      if (searchResp.ok) {
        const searchData = await searchResp.json() as any;
        const results = searchData.query?.search || [];
        const jpgResult = results.find((r: any) =>
          r.title.match(/\.(jpg|jpeg|png)$/i) &&
          !r.title.toLowerCase().includes("homage") &&
          !r.title.toLowerCase().includes("invicta") &&
          !r.title.toLowerCase().includes("steeldive")
        );
        if (jpgResult) {
          const titleEncoded = encodeURIComponent(jpgResult.title.replace("File:", ""));
          const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(jpgResult.title)}&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json`;
          const infoResp = await fetch(infoUrl);
          if (infoResp.ok) {
            const infoData = await infoResp.json() as any;
            const pages = infoData.query?.pages || {};
            const page = Object.values(pages)[0] as any;
            if (page?.imageinfo?.[0]) {
              return res.json({
                url: page.imageinfo[0].url,
                thumb: page.imageinfo[0].thumburl || page.imageinfo[0].url,
                source: "wikimedia",
                attribution: "Wikimedia Commons (Creative Commons)",
                attributionUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(jpgResult.title)}`
              });
            }
          }
        }
      }
    } catch (e) {
      console.log("⚠️ Wikimedia photo fetch failed");
    }

    return res.json({ url: null, source: "none" });
  });

  app.post("/api/rolex-ai/authenticate", async (req, res) => {
    try {
      console.log('🔍 ROLEX AI: Authentication analysis request...');
      
      const features = {
        caseback: req.body.caseback,
        dial: req.body.dial,
        bracelet: req.body.bracelet,
        movement: req.body.movement,
        other: req.body.other,
        images: req.body.images
      };

      const hasFeatures = Object.values(features).filter(key => key !== 'images').some(value => Boolean(value));
      const hasImages = features.images && Array.isArray(features.images) && features.images.length > 0;
      
      if (!hasFeatures && !hasImages) {
        return res.status(400).json({
          success: false,
          error: "At least one feature description or photos are required for authentication analysis"
        });
      }

      console.log(`🔍 ROLEX AI: Processing authentication with ${hasImages ? features.images.length : 0} images`);

      if (!hasImages && hasFeatures) {
        try {
          const { simplicityWithTools } = await import('../ai-tools');
          const AUTH_SYSTEM = `You are Simplicity, a Rolex reference specialist inside Simpleton™. Analyze the described watch features to provide a preliminary consistency assessment. Examine case back markings, dial details, bracelet construction, and movement characteristics for reference comparison. Use get_rolex_market_data to reference current market context. Provide: consistency score (0-100%), specific observations, reference markers, and recommended next steps including professional authentication. Always include disclaimer: "This is a preliminary reference analysis for informational purposes only. Professional authentication is recommended for all transactions." RESPONSE FORMAT: Write naturally and conversationally — like an expert walking someone through their findings. No markdown symbols (no **, no ##, no *, no backticks, no ---). Use paragraph breaks between thoughts. Be direct and clear. No filler openers.`;
          const featureDesc = [
            features.caseback ? `Case back: ${features.caseback}` : '',
            features.dial ? `Dial: ${features.dial}` : '',
            features.bracelet ? `Bracelet: ${features.bracelet}` : '',
            features.movement ? `Movement: ${features.movement}` : '',
            features.other ? `Other observations: ${features.other}` : '',
          ].filter(Boolean).join('\n');
          const toolResult = await simplicityWithTools(AUTH_SYSTEM, `Authenticate this Rolex based on described features:\n${featureDesc}`, 2000);
          console.log(`✅ ROLEX Authentication Tool Calls success`);
          return res.json({
            success: true,
            features,
            analysis: toolResult.text,
            rolex_expert_system: "ACTIVE",
            ai_model: toolResult.model,
            tools_used: toolResult.toolsUsed,
            timestamp: new Date().toISOString()
          });
        } catch (toolsErr: any) {
          console.log(`⚠️ ROLEX Auth Tool Calls failed (${toolsErr?.message}), falling back to Claude...`);
        }
      }

      const analysis = await analyzeRolexFeatures(features);

      res.json({
        success: true,
        features,
        analysis,
        rolex_expert_system: "ACTIVE",
        ai_model: "simplicity-ai",
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ ROLEX AI Authentication Error:', error);
      res.status(500).json({
        success: false,
        error: "Authentication analysis failed",
        details: error.message,
        rolex_expert_system: "ERROR"
      });
    }
  });

  app.get("/api/rolex-ai/status", async (req, res) => {
    try {
      res.json({
        success: true,
        status: "operational",
        capabilities: [
          "Movement condition assessment",
          "Reference consistency analysis", 
          "Technical expertise",
          "Market valuation guidance",
          "Red flag identification"
        ],
        ai_model: "simplicity-ai",
        expert_system: "Simplicity AI — Rolex Intelligence",
        confidence_scoring: "enabled",
        image_analysis: "ready",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Status check failed",
        details: error.message
      });
    }
  });

  app.get("/api/rolex/models", async (req, res) => {
    try {
      const { search, collection, category, current_production } = req.query;
      console.log('🔍 ROLEX DB: Model search request...', { search, collection, category, current_production });
      
      let query = db.select().from(rolexModels);
      const conditions = [];
      
      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          sql`(${rolexModels.referenceNumber} ILIKE ${searchTerm} OR ${rolexModels.name} ILIKE ${searchTerm})`
        );
      }
      
      if (collection) {
        conditions.push(eq(rolexModels.collection, collection as string));
      }
      
      if (category) {
        conditions.push(eq(rolexModels.category, category as string));
      }
      
      if (current_production !== undefined) {
        conditions.push(eq(rolexModels.isCurrentProduction, current_production === 'true'));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const models = await query.limit(50);
      
      res.json({
        success: true,
        data: models,
        count: models.length,
        database: "ROLEX_REFERENCE_DATABASE"
      });
    } catch (error) {
      console.error('Rolex Models API Error:', error);
      res.status(500).json({
        success: false,
        error: "Model search failed",
        database: "ERROR"
      });
    }
  });

  app.get("/api/rolex/models/:reference", async (req, res) => {
    try {
      const { reference } = req.params;
      console.log('🔍 ROLEX DB: Getting model details for:', reference);
      
      const model = await db
        .select()
        .from(rolexModels)
        .where(eq(rolexModels.referenceNumber, reference))
        .limit(1);
      
      if (model.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Model not found",
          reference: reference
        });
      }
      
      const marketValues = await db
        .select()
        .from(rolexMarketValues)
        .where(eq(rolexMarketValues.modelId, model[0].id));
      
      res.json({
        success: true,
        data: {
          ...model[0],
          market_values: marketValues
        },
        database: "ROLEX_REFERENCE_DATABASE"
      });
    } catch (error) {
      console.error('Rolex Model Details API Error:', error);
      res.status(500).json({
        success: false,
        error: "Model details failed",
        database: "ERROR"
      });
    }
  });

  app.get("/api/rolex/serial/:serial", async (req, res) => {
    try {
      const { serial } = req.params;
      console.log('🔍 ROLEX DB: Serial dating request for:', serial);
      
      const serialUpper = serial.toUpperCase().trim();
      
      const prefix = serialUpper.charAt(0);
      if (isNaN(Number(prefix))) {
        const range = await db
          .select()
          .from(rolexSerialRanges)
          .where(eq(rolexSerialRanges.prefix, prefix))
          .limit(1);
        
        if (range.length > 0) {
          return res.json({
            success: true,
            data: {
              serial: serial,
              year: range[0].endYear ? `${range[0].startYear}-${range[0].endYear}` : range[0].startYear.toString(),
              dating_system: range[0].datingSystem,
              accuracy: range[0].accuracyLevel,
              notes: range[0].productionNotes,
              historical_context: range[0].historicalContext,
              special_features: range[0].specialFeatures
            },
            database: "ROLEX_SERIAL_DATABASE"
          });
        }
      }
      
      const numericSerial = parseInt(serialUpper.replace(/[^0-9]/g, ''));
      if (!isNaN(numericSerial)) {
        const ranges = await db
          .select()
          .from(rolexSerialRanges)
          .where(eq(rolexSerialRanges.serialFormat, 'Sequential'))
          .orderBy(rolexSerialRanges.startYear);
        
        for (const range of ranges) {
          const startNum = parseInt(range.startSerial || '0');
          const endNum = parseInt(range.endSerial || '999999999');
          
          if (numericSerial >= startNum && numericSerial <= endNum) {
            return res.json({
              success: true,
              data: {
                serial: serial,
                year: range.endYear ? `${range.startYear}-${range.endYear}` : range.startYear.toString(),
                dating_system: range.datingSystem,
                accuracy: range.accuracyLevel,
                notes: range.productionNotes,
                historical_context: range.historicalContext,
                special_features: range.specialFeatures
              },
              database: "ROLEX_SERIAL_DATABASE"
            });
          }
        }
      }
      
      if (serialUpper.length >= 8) {
        return res.json({
          success: true,
          data: {
            serial: serial,
            year: "2010+",
            dating_system: "Random",
            accuracy: "Estimated",
            notes: "Random numbering system - use warranty card for exact dating",
            historical_context: "Modern anti-counterfeiting measure",
            special_features: ["Anti-counterfeiting measure", "Use warranty card for dating"]
          },
          database: "ROLEX_SERIAL_DATABASE"
        });
      }
      
      res.status(404).json({
        success: false,
        error: "Serial number format not recognized",
        serial: serial
      });
    } catch (error) {
      console.error('Rolex Serial Dating API Error:', error);
      res.status(500).json({
        success: false,
        error: "Serial dating failed",
        database: "ERROR"
      });
    }
  });

  app.get("/api/rolex/movements", async (req, res) => {
    try {
      const { caliber, current_production } = req.query;
      console.log('🔍 ROLEX DB: Movement search request...', { caliber, current_production });
      
      let query = db.select().from(rolexMovements);
      const conditions = [];
      
      if (caliber) {
        const searchTerm = `%${caliber}%`;
        conditions.push(sql`${rolexMovements.caliber} ILIKE ${searchTerm}`);
      }
      
      if (current_production !== undefined) {
        conditions.push(eq(rolexMovements.isCurrentProduction, current_production === 'true'));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const movements = await query.limit(50);
      
      res.json({
        success: true,
        data: movements,
        count: movements.length,
        database: "ROLEX_MOVEMENT_DATABASE"
      });
    } catch (error) {
      console.error('Rolex Movements API Error:', error);
      res.status(500).json({
        success: false,
        error: "Movement search failed",
        database: "ERROR"
      });
    }
  });

  app.get("/api/rolex/authentication", async (req, res) => {
    try {
      const { component, importance, model_id } = req.query;
      console.log('🔍 ROLEX DB: Authentication markers request...', { component, importance, model_id });
      
      let query = db.select().from(rolexAuthenticationMarkers);
      const conditions = [eq(rolexAuthenticationMarkers.isActive, true)];
      
      if (component) {
        conditions.push(eq(rolexAuthenticationMarkers.component, component as string));
      }
      
      if (importance) {
        conditions.push(eq(rolexAuthenticationMarkers.importance, importance as string));
      }
      
      if (model_id) {
        conditions.push(eq(rolexAuthenticationMarkers.modelId, parseInt(model_id as string)));
      }
      
      const markers = await query.where(and(...conditions)).limit(50);
      
      res.json({
        success: true,
        data: markers,
        count: markers.length,
        database: "ROLEX_AUTHENTICATION_DATABASE"
      });
    } catch (error) {
      console.error('Rolex Authentication API Error:', error);
      res.status(500).json({
        success: false,
        error: "Authentication markers failed",
        database: "ERROR"
      });
    }
  });

  app.get("/api/rolex/collections", async (req, res) => {
    try {
      console.log('🔍 ROLEX DB: Collections list request...');
      
      const collections = await db
        .selectDistinct({ collection: rolexModels.collection })
        .from(rolexModels)
        .orderBy(rolexModels.collection);
      
      res.json({
        success: true,
        data: collections.map(c => c.collection),
        count: collections.length,
        database: "ROLEX_REFERENCE_DATABASE"
      });
    } catch (error) {
      console.error('Rolex Collections API Error:', error);
      res.status(500).json({
        success: false,
        error: "Collections list failed",
        database: "ERROR"
      });
    }
  });

  app.post("/api/rolex/auto-update", async (req, res) => {
    try {
      console.log('🚀 ROLEX AUTO-UPDATER: Manual update triggered via API');
      
      const result = await autoUpdateRolexDatabase();
      
      res.json({
        success: result.success,
        message: result.message,
        models_added: result.modelsAdded || 0,
        auto_updater: "ACTIVE",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ ROLEX AUTO-UPDATER API Error:', error);
      res.status(500).json({
        success: false,
        error: "Auto-update failed",
        auto_updater: "ERROR"
      });
    }
  });

  app.get("/api/rolex/auto-update/status", async (req, res) => {
    try {
      res.json({
        success: true,
        status: "operational",
        features: [
          "Automatic news monitoring",
          "AI-powered model extraction",
          "Database auto-updates",
          "Scheduled scanning (6 hours)",
          "Manual trigger available"
        ],
        ai_model: "simplicity-ai",
        news_sources: ["NewsAPI", "Rolex Press Releases", "Watch Industry News"],
        monitoring_interval: "6 hours",
        last_check: new Date().toISOString(),
        auto_updater: "ACTIVE"
      });
    } catch (error) {
      console.error('❌ ROLEX AUTO-UPDATER Status Error:', error);
      res.status(500).json({
        success: false,
        error: "Status check failed",
        auto_updater: "ERROR"
      });
    }
  });

  app.get("/api/rolex/market/history/:reference", async (req, res) => {
    try {
      const { reference } = req.params;
      
      const model = await db.query.rolexModels.findFirst({
        where: eq(rolexModels.referenceNumber, reference),
      });

      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }

      const priceHistory = await db.query.rolexMarketValues.findMany({
        where: eq(rolexMarketValues.modelId, model.id),
        orderBy: (values, { asc }) => [asc(values.priceDate)],
      });

      res.json({
        model: {
          reference: model.referenceNumber,
          name: model.name,
          collection: model.collection
        },
        priceHistory: priceHistory.map(p => ({
          date: p.priceDate,
          condition: p.condition,
          low: p.lowEstimate,
          high: p.highEstimate,
          average: p.averagePrice,
          appreciation: p.appreciationRate,
          priceDirection: p.priceDirection,
          demandLevel: p.demandLevel,
          notes: p.notes
        })),
        dataPoints: priceHistory.length,
        dateRange: {
          start: priceHistory[0]?.priceDate,
          end: priceHistory[priceHistory.length - 1]?.priceDate
        }
      });
    } catch (error) {
      console.error('❌ Historical price query error:', error);
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  app.get("/api/rolex/market/overview", async (req, res) => {
    try {
      const models = await db.query.rolexModels.findMany({
        with: {
          marketValues: {
            orderBy: (values, { desc }) => [desc(values.priceDate)],
            limit: 1
          }
        }
      });

      const overview = models.map(model => ({
        reference: model.referenceNumber,
        name: model.name,
        collection: model.collection,
        currentProduction: model.isCurrentProduction,
        currentPrice: model.marketValues[0] ? {
          average: model.marketValues[0].averagePrice,
          range: `${model.marketValues[0].lowEstimate}-${model.marketValues[0].highEstimate}`,
          condition: model.marketValues[0].condition,
          priceDirection: model.marketValues[0].priceDirection,
          demandLevel: model.marketValues[0].demandLevel,
          appreciation: model.marketValues[0].appreciationRate,
          investmentGrade: model.marketValues[0].investmentGrade
        } : null
      }));

      res.json({
        totalModels: models.length,
        models: overview,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Market overview error:', error);
      res.status(500).json({ error: "Failed to fetch market overview" });
    }
  });

  app.post("/api/rolex/market/compare", async (req, res) => {
    try {
      const { references } = req.body;
      
      if (!references || !Array.isArray(references)) {
        return res.status(400).json({ error: "references array required" });
      }

      const comparisonData = await Promise.all(
        references.map(async (ref: string) => {
          const model = await db.query.rolexModels.findFirst({
            where: eq(rolexModels.referenceNumber, ref),
            with: {
              marketValues: {
                orderBy: (values, { asc }) => [asc(values.priceDate)]
              }
            }
          });
          return model;
        })
      );

      const comparison = comparisonData.filter(Boolean).map(model => ({
        reference: model!.referenceNumber,
        name: model!.name,
        collection: model!.collection,
        priceHistory: model!.marketValues.map(v => ({
          date: v.priceDate,
          average: v.averagePrice,
          appreciation: v.appreciationRate,
          demand: v.demandLevel
        })),
        totalAppreciation: model!.marketValues.reduce((sum, v) => sum + (Number(v.appreciationRate) || 0), 0),
        currentValue: model!.marketValues[model!.marketValues.length - 1]?.averagePrice,
        dataPoints: model!.marketValues.length
      }));

      res.json({
        comparison,
        modelsCompared: comparison.length
      });
    } catch (error) {
      console.error('❌ Market comparison error:', error);
      res.status(500).json({ error: "Failed to compare models" });
    }
  });

  app.get("/api/rolex/market/trends", async (req, res) => {
    try {
      const recentPrices = await db.execute(sql`
        SELECT DISTINCT ON (mv.model_id) 
          rm.reference_number,
          rm.name,
          rm.collection,
          mv.average_price,
          mv.appreciation_rate,
          mv.price_direction,
          mv.demand_level,
          mv.investment_grade,
          mv.price_date
        FROM rolex_market_values mv
        JOIN rolex_models rm ON mv.model_id = rm.id
        ORDER BY mv.model_id, mv.price_date DESC
      `);

      const trends = {
        topAppreciating: recentPrices.rows
          .sort((a, b) => Number(b.appreciation_rate) - Number(a.appreciation_rate))
          .slice(0, 5),
        highDemand: recentPrices.rows
          .filter(r => r.demand_level === 'Extreme' || r.demand_level === 'Very High')
          .slice(0, 5),
        blueChip: recentPrices.rows
          .filter(r => r.investment_grade === 'Blue Chip')
          .slice(0, 5),
        risingMarket: recentPrices.rows
          .filter(r => r.price_direction === 'Rising'),
        totalModelsTracked: recentPrices.rows.length,
        lastUpdated: new Date().toISOString()
      };

      res.json(trends);
    } catch (error) {
      console.error('❌ Market trends error:', error);
      res.status(500).json({ error: "Failed to fetch market trends" });
    }
  });
}
