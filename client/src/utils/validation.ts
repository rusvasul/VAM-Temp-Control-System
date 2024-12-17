import Joi from 'joi';

export interface ValidationError {
  field: string;
  message: string;
}

const baseSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Recipe name is required',
    'any.required': 'Recipe name is required'
  }),
  beverageType: Joi.string().valid('mead', 'cider', 'beer').required(),
  yeast: Joi.object({
    type: Joi.string().required(),
    weight: Joi.number().min(0).required(),
    pitchingDelay: Joi.number().min(0).required()
  }).required(),
  temperature: Joi.object({
    fermentation: Joi.number().min(32).max(100).required(),
    crash: Joi.number().min(32).max(100).required()
  }).required(),
  nutrients: Joi.object({
    fermax: Joi.object({
      initialAmount: Joi.number().min(0).required(),
      timing: Joi.object({
        additionPoint: Joi.string().required(),
        mixingDuration: Joi.number().min(0).required()
      }).required()
    }).required()
  }).required(),
  additives: Joi.object({
    bentonite: Joi.object({
      amount: Joi.number().min(0).required(),
      sgThreshold: Joi.number().min(0.9).max(1.2).required()
    }).required(),
    sparkolloid: Joi.object({
      amount: Joi.number().min(0).required(),
      sgThreshold: Joi.number().min(0.9).max(1.2).required()
    }).required()
  }).required(),
  operationTiming: Joi.object({
    primaryFermentationDays: Joi.number().min(1).required(),
    secondaryFermentationDays: Joi.number().min(0).optional(),
    clarificationDays: Joi.number().min(1).required(),
    conditioningDays: Joi.number().min(1).required()
  }).required()
});

const meadSchema = baseSchema.keys({
  beverageType: Joi.string().valid('mead').required(),
  preStartRequirements: Joi.object({
    honeyPreHeat: Joi.object({
      temperature: Joi.number().required(),
      duration: Joi.number().required()
    }).required(),
    equipment: Joi.object({
      ozonator: Joi.boolean().required(),
      flowmeter: Joi.boolean().required(),
      corrugatedHoses: Joi.number().required(),
      starSanBucket: Joi.boolean().required()
    }).required()
  }).required(),
  honeyReadings: Joi.object({
    brix: Joi.number().required(),
    weight: Joi.number().required(),
    volume: Joi.number().required(),
    variety: Joi.string().required(),
    drumCount: Joi.number().required(),
    pumpSpeed: Joi.number().required()
  }).required(),
  waterAddition: Joi.object({
    targetVolume: Joi.number().required(),
    o3Used: Joi.boolean().required(),
    flowmeterSettings: Joi.object({
      mode: Joi.string().required(),
      display: Joi.string().required()
    }).required()
  }).required(),
  targetGravity: Joi.object({
    original: Joi.number().required(),
    tolerance: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required()
    }).required()
  }).required(),
  processSteps: Joi.object({
    honeyPumping: Joi.object({
      duration: Joi.number().required()
    }).required(),
    waterAddition: Joi.object({
      targetVolume: Joi.number().required(),
      mixingDuration: Joi.number().required()
    }).required(),
    nutrientMixing: Joi.object({
      duration: Joi.number().required()
    }).required(),
    recirculation: Joi.object({
      intervalDays: Joi.number().required()
    }).required()
  }).required(),
  timingIntervals: Joi.object({
    oxygenation: Joi.object({
      initialMinutes: Joi.number().min(0).required(),
      recircMinutes: Joi.number().min(0).required()
    }).required(),
    fermentation: Joi.object({
      durationDays: Joi.number().min(1).required()
    }).required(),
    clarification: Joi.object({
      bentoniteDays: Joi.number().min(0).required(),
      sparkolloidDays: Joi.number().min(0).required(),
      settleDays: Joi.number().min(0).required()
    }).required(),
    conditioning: Joi.object({
      daysBeforeBottling: Joi.number().min(0).required(),
      agingMonths: Joi.number().min(0).required()
    }).required()
  }).required()
});

const ciderSchema = baseSchema.keys({
  juice: Joi.object({
    varieties: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      percentage: Joi.number().min(0).max(100).required()
    })).required(),
    initialGravity: Joi.number().min(0.9).max(1.2).required(),
    pH: Joi.number().min(0).max(14).required(),
    totalVolume: Joi.number().min(0).required(),
    primaryVolume: Joi.number().min(0).required(),
    secondaryVolume: Joi.number().min(0).optional()
  }).required(),
  additions: Joi.object({
    tannin: Joi.number().min(0).optional(),
    acidBlend: Joi.number().min(0).optional(),
    pecticEnzyme: Joi.number().min(0).optional()
  }).optional()
});

const beerSchema = baseSchema.keys({
  grainBill: Joi.array().items(Joi.object({
    grain: Joi.string().required(),
    weight: Joi.number().min(0).required(),
    percentage: Joi.number().min(0).max(100).required()
  })).required(),
  mash: Joi.object({
    strikeTemp: Joi.number().min(0).required(),
    mashTemp: Joi.number().min(0).required(),
    mashTime: Joi.number().min(0).required(),
    spargeTemp: Joi.number().min(0).required()
  }).required(),
  tempStages: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    temp: Joi.number().min(0).required(),
    duration: Joi.number().min(0).required(),
    description: Joi.string().optional()
  })).required(),
  hops: Joi.array().items(Joi.object({
    variety: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    alpha: Joi.number().min(0).max(100).required(),
    time: Joi.number().min(0).required(),
    type: Joi.string().valid('bittering', 'flavor', 'aroma', 'dryHop').required()
  })).required(),
  water: Joi.object({
    mashVolume: Joi.number().min(0).required(),
    spargeVolume: Joi.number().min(0).required(),
    targetProfile: Joi.object({
      pH: Joi.number().min(0).max(14).required(),
      calcium: Joi.number().min(0).required(),
      magnesium: Joi.number().min(0).required(),
      sulfate: Joi.number().min(0).required(),
      chloride: Joi.number().min(0).required(),
      bicarbonate: Joi.number().min(0).required()
    }).required()
  }).required(),
  style: Joi.object({
    ibu: Joi.number().min(0).required(),
    srm: Joi.number().min(0).required(),
    og: Joi.number().min(0.9).max(1.2).required(),
    fg: Joi.number().min(0.9).max(1.2).required(),
    abv: Joi.number().min(0).max(20).required()
  }).required()
});

export const validateBrewStyle = (data: any): { isValid: boolean; errors?: ValidationError[] } => {
  let schema;
  switch (data.beverageType) {
    case 'mead':
      schema = meadSchema;
      break;
    case 'cider':
      schema = ciderSchema;
      break;
    case 'beer':
      schema = beerSchema;
      break;
    default:
      return { isValid: false, errors: [{ field: 'beverageType', message: 'Invalid beverage type' }] };
  }

  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { isValid: false, errors };
  }

  return { isValid: true };
};

// Helper function to get field-specific error message
export const getFieldError = (
  field: string, 
  errors?: ValidationError[]
): string | undefined => {
  if (!errors) return undefined;
  const error = errors.find(err => err.field === field);
  return error?.message;
};

// Helper function to check if a field has an error
export const hasFieldError = (
  field: string, 
  errors?: ValidationError[]
): boolean => {
  return !!getFieldError(field, errors);
}; 