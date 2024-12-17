const mongoose = require('mongoose');

const brewStyleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  beverageType: { 
    type: String, 
    required: true,
    enum: ['mead', 'cider', 'beer']
  },
  // Common fields for all types
  yeast: {
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    pitchingDelay: { type: Number, required: true }
  },
  temperature: {
    fermentation: { type: Number, required: true },
    crash: { type: Number, required: true }
  },
  nutrients: {
    fermax: {
      initialAmount: { type: Number, required: true },
      timing: {
        additionPoint: { type: String, required: true },
        mixingDuration: { type: Number, required: true }
      }
    }
  },
  additives: {
    bentonite: {
      amount: { type: Number, required: function() { return this.beverageType === 'mead'; } },
      sgThreshold: { type: Number, required: function() { return this.beverageType === 'mead'; } }
    },
    sparkolloid: {
      amount: { type: Number, required: function() { return this.beverageType === 'mead'; } },
      sgThreshold: { type: Number, required: function() { return this.beverageType === 'mead'; } }
    }
  },
  operationTiming: {
    primaryFermentationDays: { type: Number, required: true },
    secondaryFermentationDays: { type: Number },
    clarificationDays: { type: Number, required: true },
    conditioningDays: { type: Number, required: true }
  },
  // Mead specific fields
  preStartRequirements: {
    honeyPreHeat: {
      temperature: { type: Number },
      duration: { type: Number }
    },
    equipment: {
      ozonator: { type: Boolean },
      flowmeter: { type: Boolean },
      corrugatedHoses: { type: Number },
      starSanBucket: { type: Boolean }
    }
  },
  honeyReadings: {
    brix: { type: Number },
    weight: { type: Number },
    volume: { type: Number },
    variety: { type: String },
    drumCount: { type: Number },
    pumpSpeed: { type: Number }
  },
  waterAddition: {
    targetVolume: { type: Number },
    o3Used: { type: Boolean },
    flowmeterSettings: {
      mode: { type: String },
      display: { type: String }
    }
  },
  targetGravity: {
    original: { type: Number },
    tolerance: {
      min: { type: Number },
      max: { type: Number }
    }
  },
  processSteps: {
    honeyPumping: {
      duration: { type: Number }
    },
    waterAddition: {
      targetVolume: { type: Number },
      mixingDuration: { type: Number }
    },
    nutrientMixing: {
      duration: { type: Number }
    },
    recirculation: {
      intervalDays: { type: Number }
    }
  },
  timingIntervals: {
    oxygenation: {
      initialMinutes: { type: Number },
      recircMinutes: { type: Number }
    },
    fermentation: {
      durationDays: { type: Number }
    },
    clarification: {
      bentoniteDays: { type: Number },
      sparkolloidDays: { type: Number },
      settleDays: { type: Number }
    },
    conditioning: {
      daysBeforeBottling: { type: Number },
      agingMonths: { type: Number }
    }
  },
  // Cider specific fields
  juice: {
    varieties: [{
      name: { type: String },
      percentage: { type: Number }
    }],
    initialGravity: { type: Number },
    pH: { type: Number },
    totalVolume: { type: Number },
    primaryVolume: { type: Number },
    secondaryVolume: { type: Number }
  },
  additions: {
    tannin: { type: Number },
    acidBlend: { type: Number },
    pecticEnzyme: { type: Number }
  },
  // Beer specific fields
  grainBill: [{
    grain: { type: String },
    weight: { type: Number },
    percentage: { type: Number }
  }],
  mash: {
    strikeTemp: { type: Number },
    mashTemp: { type: Number },
    mashTime: { type: Number },
    spargeTemp: { type: Number }
  },
  tempStages: [{
    name: { type: String },
    temp: { type: Number },
    duration: { type: Number },
    description: { type: String }
  }],
  hops: [{
    variety: { type: String },
    amount: { type: Number },
    alpha: { type: Number },
    time: { type: Number },
    type: {
      type: String,
      enum: ['bittering', 'flavor', 'aroma', 'dryHop']
    }
  }],
  water: {
    mashVolume: { type: Number },
    spargeVolume: { type: Number },
    targetProfile: {
      pH: { type: Number },
      calcium: { type: Number },
      magnesium: { type: Number },
      sulfate: { type: Number },
      chloride: { type: Number },
      bicarbonate: { type: Number }
    }
  },
  style: {
    ibu: { type: Number },
    srm: { type: Number },
    og: { type: Number },
    fg: { type: Number },
    abv: { type: Number }
  },
  recipeDocument: {
    fileName: String,
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx'],
    },
    fileUrl: String,
    uploadedAt: Date
  }
}, {
  timestamps: true
});

// Add conditional validation based on beverageType
brewStyleSchema.pre('validate', function(next) {
  if (this.beverageType === 'mead') {
    if (!this.preStartRequirements?.honeyPreHeat?.temperature || 
        !this.preStartRequirements?.honeyPreHeat?.duration ||
        !this.honeyReadings?.brix ||
        !this.honeyReadings?.weight ||
        !this.honeyReadings?.volume ||
        !this.honeyReadings?.variety ||
        !this.waterAddition?.targetVolume ||
        !this.targetGravity?.original) {
      return next(new Error('Mead recipes require complete honey and water details'));
    }
  } else if (this.beverageType === 'cider') {
    if (!this.juice?.varieties?.length || !this.juice?.initialGravity) {
      return next(new Error('Cider recipes require juice details'));
    }
  } else if (this.beverageType === 'beer') {
    if (!this.grainBill?.length || !this.mash?.mashTemp) {
      return next(new Error('Beer recipes require grain bill and mash details'));
    }
  }
  next();
});

module.exports = mongoose.model('BrewStyle', brewStyleSchema);