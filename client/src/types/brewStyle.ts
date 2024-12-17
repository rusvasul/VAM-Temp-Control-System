export type BeverageType = 'mead' | 'cider' | 'beer';

interface BaseRecipe {
  _id?: string;
  name: string;
  beverageType: BeverageType;
  yeast: {
    type: string;
    weight: number;
    pitchingDelay: number;
  };
  temperature: {
    fermentation: number;
    crash: number;
  };
  nutrients: {
    fermax: {
      initialAmount: number;
      timing: {
        additionPoint: string;
        mixingDuration: number;
      };
    };
  };
  operationTiming: {
    primaryFermentationDays: number;
    clarificationDays: number;
    conditioningDays: number;
  };
  recipeDocument?: {
    fileName: string;
    fileType: 'pdf' | 'doc' | 'docx';
    fileUrl: string;
    uploadedAt: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MeadRecipe extends BaseRecipe {
  beverageType: 'mead';
  preStartRequirements: {
    honeyPreHeat: {
      temperature: number;
      duration: number;
    };
    equipment: {
      ozonator: boolean;
      flowmeter: boolean;
      corrugatedHoses: number;
      starSanBucket: boolean;
    };
  };
  honeyReadings: {
    brix: number;
    weight: number;
    volume: number;
    variety: string;
    drumCount: number;
    pumpSpeed: number;
  };
  waterAddition: {
    targetVolume: number;
    o3Used: boolean;
    flowmeterSettings: {
      mode: string;
      display: string;
    };
  };
  targetGravity: {
    original: number;
    tolerance: {
      min: number;
      max: number;
    };
  };
  processSteps: {
    honeyPumping: {
      duration: number;
    };
    waterAddition: {
      targetVolume: number;
      mixingDuration: number;
    };
    nutrientMixing: {
      duration: number;
    };
    recirculation: {
      intervalDays: number;
    };
  };
  timingIntervals: {
    oxygenation: {
      initialMinutes: number;
      recircMinutes: number;
    };
    fermentation: {
      durationDays: number;
    };
    clarification: {
      bentoniteDays: number;
      sparkolloidDays: number;
      settleDays: number;
    };
    conditioning: {
      daysBeforeBottling: number;
      agingMonths: number;
    };
  };
}

export interface CiderRecipe extends BaseRecipe {
  beverageType: 'cider';
  juice: {
    varieties: {
      name: string;
      percentage: number;
    }[];
    initialGravity: number;
    pH: number;
    totalVolume: number;
    primaryVolume: number;
    secondaryVolume?: number;
  };
  additions: {
    tannin?: number;
    acidBlend?: number;
    pecticEnzyme?: number;
  };
}

export interface BeerRecipe extends BaseRecipe {
  beverageType: 'beer';
  grainBill: {
    grain: string;
    weight: number;
    percentage: number;
  }[];
  mash: {
    strikeTemp: number;
    mashTemp: number;
    mashTime: number;
    spargeTemp: number;
  };
  tempStages: {
    name: string;
    temp: number;
    duration: number;
    description?: string;
  }[];
  hops: {
    variety: string;
    amount: number;
    alpha: number;
    time: number;
    type: 'bittering' | 'flavor' | 'aroma' | 'dryHop';
  }[];
  water: {
    mashVolume: number;
    spargeVolume: number;
    targetProfile: {
      pH: number;
      calcium: number;
      magnesium: number;
      sulfate: number;
      chloride: number;
      bicarbonate: number;
    };
  };
  style: {
    ibu: number;
    srm: number;
    og: number;
    fg: number;
    abv: number;
  };
}

export type BrewStyle = MeadRecipe | CiderRecipe | BeerRecipe; 