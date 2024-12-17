import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { createBrewStyle, updateBrewStyle } from "@/api/brewStyles";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { validateBrewStyle, ValidationError } from '@/utils/validation';
import { RecipeDocumentUpload } from './RecipeDocumentUpload';
import { uploadRecipeDocument, deleteRecipeDocument } from '@/api/brewStyles';

type BeverageType = 'mead' | 'cider' | 'beer';

interface BrewStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingStyle?: BrewStyle;
}

interface BaseRecipe {
  id?: string;
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
  additives: {
    bentonite: {
      amount: number;
      sgThreshold: number;
    };
    sparkolloid: {
      amount: number;
      sgThreshold: number;
    };
  };
  operationTiming: {
    primaryFermentationDays: number;
    secondaryFermentationDays?: number;
    clarificationDays: number;
    conditioningDays: number;
  };
}

interface MeadRecipe extends BaseRecipe {
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

interface CiderRecipe extends BaseRecipe {
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

interface BeerRecipe extends BaseRecipe {
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
    duration: number; // in hours
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

type BrewStyle = MeadRecipe | CiderRecipe | BeerRecipe;

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export function BrewStyleDialog({ open, onOpenChange, onSuccess, editingStyle }: BrewStyleDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [beverageType, setBeverageType] = React.useState<BeverageType>(editingStyle?.beverageType || 'mead');

  const initializeFormData = (type: BeverageType, existingStyle?: BrewStyle): BrewStyle => {
    if (existingStyle) {
      return { ...existingStyle };
    }

    const baseData = {
      name: "",
      beverageType: type,
      yeast: {
        type: "Lalvin D47",
        weight: 1.75,
        pitchingDelay: 24
      },
      temperature: {
        fermentation: 65,
        crash: 34
      },
      nutrients: {
        fermax: {
          initialAmount: 1,
          timing: {
            additionPoint: "After water addition",
            mixingDuration: 15
          }
        }
      },
      additives: {
        bentonite: {
          amount: 1,
          sgThreshold: 1.010
        },
        sparkolloid: {
          amount: 0.5,
          sgThreshold: 1.002
        }
      },
      operationTiming: {
        primaryFermentationDays: 21,
        clarificationDays: 14,
        conditioningDays: 30
      }
    };

    switch (type) {
      case 'mead':
        return {
          ...baseData,
          beverageType: 'mead' as const,
          preStartRequirements: {
            honeyPreHeat: {
              temperature: 80,
              duration: 24
            },
            equipment: {
              ozonator: true,
              flowmeter: true,
              corrugatedHoses: 4,
              starSanBucket: true
            }
          },
          honeyReadings: {
            brix: 80,
            weight: 60,
            volume: 55,
            variety: "Wildflower",
            drumCount: 4,
            pumpSpeed: 35
          },
          waterAddition: {
            targetVolume: 2700,
            o3Used: true,
            flowmeterSettings: {
              mode: "2 Batch",
              display: "LT"
            }
          },
          targetGravity: {
            original: 1.100,
            tolerance: {
              min: 1.096,
              max: 1.101
            }
          },
          processSteps: {
            honeyPumping: {
              duration: 60
            },
            waterAddition: {
              targetVolume: 2700,
              mixingDuration: 15
            },
            nutrientMixing: {
              duration: 15
            },
            recirculation: {
              intervalDays: 7
            }
          },
          timingIntervals: {
            oxygenation: {
              initialMinutes: 15,
              recircMinutes: 5
            },
            fermentation: {
              durationDays: 21
            },
            clarification: {
              bentoniteDays: 7,
              sparkolloidDays: 7,
              settleDays: 14
            },
            conditioning: {
              daysBeforeBottling: 14,
              agingMonths: 6
            }
          }
        } as MeadRecipe;
      case 'cider':
        return {
          ...baseData,
          beverageType: 'cider' as const,
          juice: {
            varieties: [],
            initialGravity: 1.050,
            pH: 3.5,
            totalVolume: 0,
            primaryVolume: 0,
            secondaryVolume: 0
          },
          additions: {},
          operationTiming: {
            primaryFermentationDays: 14,
            secondaryFermentationDays: 7,
            clarificationDays: 7,
            conditioningDays: 14
          }
        } as CiderRecipe;
      case 'beer':
        return {
          ...baseData,
          beverageType: 'beer' as const,
          grainBill: [],
          tempStages: [
            {
              name: 'Primary Fermentation',
              temp: 68,
              duration: 168,
              description: 'Main fermentation phase'
            },
            {
              name: 'Diacetyl Rest',
              temp: 72,
              duration: 48,
              description: 'Raise temperature to clean up diacetyl'
            },
            {
              name: 'Cold Crash',
              temp: 34,
              duration: 48,
              description: 'Drop temperature to settle yeast and proteins'
            }
          ],
          mash: {
            strikeTemp: 168,
            mashTemp: 152,
            mashTime: 60,
            spargeTemp: 170
          },
          hops: [],
          water: {
            mashVolume: 0,
            spargeVolume: 0,
            targetProfile: {
              pH: 5.2,
              calcium: 0,
              magnesium: 0,
              sulfate: 0,
              chloride: 0,
              bicarbonate: 0
            }
          },
          style: {
            ibu: 0,
            srm: 0,
            og: 1.050,
            fg: 1.010,
            abv: 5.0
          },
          operationTiming: {
            primaryFermentationDays: 14,
            secondaryFermentationDays: 7,
            clarificationDays: 3,
            conditioningDays: 14
          }
        } as BeerRecipe;
      default:
        return baseData as BrewStyle;
    }
  };

  const [formData, setFormData] = React.useState<BrewStyle>(() => 
    initializeFormData(beverageType, editingStyle)
  );

  useEffect(() => {
    if (editingStyle) {
      setBeverageType(editingStyle.beverageType);
      setFormData(editingStyle);
    }
  }, [editingStyle]);

  const processFormData = (): BrewStyle => {
    // Remove _id from the processed data when sending to server
    const { _id, ...dataWithoutId } = formData;
    
    const baseDefaults = {
      ...dataWithoutId,
      beverageType: beverageType, // Ensure beverageType is explicitly set
      additives: {
        bentonite: {
          amount: formData.additives?.bentonite?.amount || 1,
          sgThreshold: formData.additives?.bentonite?.sgThreshold || 1.010
        },
        sparkolloid: {
          amount: formData.additives?.sparkolloid?.amount || 0.5,
          sgThreshold: formData.additives?.sparkolloid?.sgThreshold || 1.002
        }
      }
    };

    switch (beverageType) {
      case 'mead':
        return {
          ...baseDefaults,
          beverageType: 'mead' as const,
          preStartRequirements: {
            honeyPreHeat: {
              temperature: formData.preStartRequirements?.honeyPreHeat?.temperature || 80,
              duration: formData.preStartRequirements?.honeyPreHeat?.duration || 24
            },
            equipment: {
              ozonator: formData.preStartRequirements?.equipment?.ozonator || true,
              flowmeter: formData.preStartRequirements?.equipment?.flowmeter || true,
              corrugatedHoses: formData.preStartRequirements?.equipment?.corrugatedHoses || 4,
              starSanBucket: formData.preStartRequirements?.equipment?.starSanBucket || true
            }
          },
          honeyReadings: {
            brix: formData.honeyReadings?.brix || 80,
            weight: formData.honeyReadings?.weight || 60,
            volume: formData.honeyReadings?.volume || 55,
            variety: formData.honeyReadings?.variety || "Wildflower",
            drumCount: formData.honeyReadings?.drumCount || 4,
            pumpSpeed: formData.honeyReadings?.pumpSpeed || 35
          },
          waterAddition: {
            targetVolume: formData.waterAddition?.targetVolume || 2700,
            o3Used: formData.waterAddition?.o3Used || true,
            flowmeterSettings: {
              mode: formData.waterAddition?.flowmeterSettings?.mode || "2 Batch",
              display: formData.waterAddition?.flowmeterSettings?.display || "LT"
            }
          },
          targetGravity: {
            original: formData.targetGravity?.original || 1.100,
            tolerance: {
              min: formData.targetGravity?.tolerance?.min || 1.096,
              max: formData.targetGravity?.tolerance?.max || 1.101
            }
          },
          processSteps: {
            honeyPumping: {
              duration: formData.processSteps?.honeyPumping?.duration || 60
            },
            waterAddition: {
              targetVolume: formData.processSteps?.waterAddition?.targetVolume || 2700,
              mixingDuration: formData.processSteps?.waterAddition?.mixingDuration || 15
            },
            nutrientMixing: {
              duration: formData.processSteps?.nutrientMixing?.duration || 15
            },
            recirculation: {
              intervalDays: formData.processSteps?.recirculation?.intervalDays || 7
            }
          },
          timingIntervals: {
            oxygenation: {
              initialMinutes: formData.timingIntervals?.oxygenation?.initialMinutes || 15,
              recircMinutes: formData.timingIntervals?.oxygenation?.recircMinutes || 5
            },
            fermentation: {
              durationDays: formData.timingIntervals?.fermentation?.durationDays || 21
            },
            clarification: {
              bentoniteDays: formData.timingIntervals?.clarification?.bentoniteDays || 7,
              sparkolloidDays: formData.timingIntervals?.clarification?.sparkolloidDays || 7,
              settleDays: formData.timingIntervals?.clarification?.settleDays || 14
            },
            conditioning: {
              daysBeforeBottling: formData.timingIntervals?.conditioning?.daysBeforeBottling || 14,
              agingMonths: formData.timingIntervals?.conditioning?.agingMonths || 6
            }
          }
        } as MeadRecipe;
      case 'cider':
        return {
          ...baseDefaults,
          beverageType: 'cider' as const,
          juice: {
            varieties: formData.juice?.varieties || [],
            initialGravity: formData.juice?.initialGravity || 1.050,
            pH: formData.juice?.pH || 3.5,
            totalVolume: formData.juice?.totalVolume || 0,
            primaryVolume: formData.juice?.primaryVolume || 0,
            secondaryVolume: formData.juice?.secondaryVolume || 0
          },
          additions: formData.additions || {}
        } as CiderRecipe;
      case 'beer':
        return {
          ...baseDefaults,
          beverageType: 'beer' as const,
          grainBill: formData.grainBill || [],
          mash: {
            strikeTemp: formData.mash?.strikeTemp || 168,
            mashTemp: formData.mash?.mashTemp || 152,
            mashTime: formData.mash?.mashTime || 60,
            spargeTemp: formData.mash?.spargeTemp || 170
          },
          tempStages: formData.tempStages || [],
          hops: formData.hops || [],
          water: {
            mashVolume: formData.water?.mashVolume || 0,
            spargeVolume: formData.water?.spargeVolume || 0,
            targetProfile: {
              pH: formData.water?.targetProfile?.pH || 5.2,
              calcium: formData.water?.targetProfile?.calcium || 0,
              magnesium: formData.water?.targetProfile?.magnesium || 0,
              sulfate: formData.water?.targetProfile?.sulfate || 0,
              chloride: formData.water?.targetProfile?.chloride || 0,
              bicarbonate: formData.water?.targetProfile?.bicarbonate || 0
            }
          },
          style: {
            ibu: formData.style?.ibu || 0,
            srm: formData.style?.srm || 0,
            og: formData.style?.og || 1.050,
            fg: formData.style?.fg || 1.010,
            abv: formData.style?.abv || 5.0
          }
        } as BeerRecipe;
      default:
        throw new Error(`Invalid beverage type: ${beverageType}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      const processedData = processFormData();
      const validationResult = await validateBrewStyle(processedData);

      if (validationResult.length > 0) {
        setValidationErrors(validationResult);
        setIsSubmitting(false);
        return;
      }

      if (editingStyle?._id) {
        await updateBrewStyle(editingStyle._id, processedData);
        toast({
          title: "Success",
          description: "Recipe updated successfully",
        });
      } else {
        await createBrewStyle(processedData);
        toast({
          title: "Success",
          description: "Recipe created successfully",
        });
      }

      setValidationErrors([]);
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting brew style:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save recipe";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Show for 5 seconds to ensure user can read it
      });
      
      // If it's a duplicate name error, add it to validation errors
      if (error.response?.data?.error === 'Duplicate name') {
        setValidationErrors([
          ...validationErrors,
          { field: 'name', message: error.response.data.message }
        ]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBeverageTypeChange = (type: BeverageType) => {
    setBeverageType(type);
    // Reset form with appropriate defaults based on type
    const baseDefaults = {
      name: formData.name || "",
      beverageType: type,
      yeast: { 
        type: "Lalvin D47", 
        weight: 1.75,
        pitchingDelay: 24
      },
      temperature: { 
        fermentation: 65, 
        crash: 34 
      },
      nutrients: {
        fermax: {
          initialAmount: 1,
          timing: {
            additionPoint: "After water addition",
            mixingDuration: 15
          }
        }
      },
      additives: {
        bentonite: {
          amount: 1,
          sgThreshold: 1.010
        },
        sparkolloid: {
          amount: 0.5,
          sgThreshold: 1.002
        }
      },
      operationTiming: {
        primaryFermentationDays: 21,
        clarificationDays: 14,
        conditioningDays: 30
      }
    };

    switch (type) {
      case 'mead':
        setFormData({
          ...baseDefaults,
          beverageType: 'mead',
          preStartRequirements: {
            honeyPreHeat: {
              temperature: 80,
              duration: 24
            },
            equipment: {
              ozonator: true,
              flowmeter: true,
              corrugatedHoses: 4,
              starSanBucket: true
            }
          },
          honeyReadings: {
            brix: 75,
            weight: 100,
            volume: 50,
            variety: "Wildflower",
            drumCount: 4,
            pumpSpeed: 35
          },
          waterAddition: {
            targetVolume: 2700,
            o3Used: true,
            flowmeterSettings: {
              mode: "2 Batch",
              display: "LT"
            }
          },
          targetGravity: {
            original: 1.100,
            tolerance: {
              min: 1.096,
              max: 1.101
            }
          },
          processSteps: {
            honeyPumping: {
              duration: 60
            },
            waterAddition: {
              targetVolume: 2700,
              mixingDuration: 15
            },
            nutrientMixing: {
              duration: 15
            },
            recirculation: {
              intervalDays: 7
            }
          },
          timingIntervals: {
            oxygenation: {
              initialMinutes: 15,
              recircMinutes: 5
            },
            fermentation: {
              durationDays: 21
            },
            clarification: {
              bentoniteDays: 7,
              sparkolloidDays: 7,
              settleDays: 14
            },
            conditioning: {
              daysBeforeBottling: 14,
              agingMonths: 6
            }
          }
        } as MeadRecipe);
        break;
      case 'cider':
        setFormData({
          ...baseDefaults,
          beverageType: 'cider',
          juice: {
            varieties: [],
            initialGravity: 1.050,
            pH: 3.5,
            totalVolume: 0,
            primaryVolume: 0,
            secondaryVolume: 0
          },
          additions: {},
          operationTiming: {
            primaryFermentationDays: 14,
            secondaryFermentationDays: 7,
            clarificationDays: 7,
            conditioningDays: 14
          }
        } as CiderRecipe);
        break;
      case 'beer':
        setFormData({
          ...baseDefaults,
          beverageType: 'beer',
          grainBill: [],
          tempStages: [
            {
              name: 'Primary Fermentation',
              temp: 68,
              duration: 168,
              description: 'Main fermentation phase'
            },
            {
              name: 'Diacetyl Rest',
              temp: 72,
              duration: 48,
              description: 'Raise temperature to clean up diacetyl'
            },
            {
              name: 'Cold Crash',
              temp: 34,
              duration: 48,
              description: 'Drop temperature to settle yeast and proteins'
            }
          ],
          mash: {
            strikeTemp: 168,
            mashTemp: 152,
            mashTime: 60,
            spargeTemp: 170
          },
          hops: [],
          water: {
            mashVolume: 0,
            spargeVolume: 0,
            targetProfile: {
              pH: 5.2,
              calcium: 0,
              magnesium: 0,
              sulfate: 0,
              chloride: 0,
              bicarbonate: 0
            }
          },
          style: {
            ibu: 0,
            srm: 0,
            og: 1.050,
            fg: 1.010,
            abv: 5.0
          },
          operationTiming: {
            primaryFermentationDays: 14,
            secondaryFermentationDays: 7,
            clarificationDays: 3,
            conditioningDays: 14
          }
        } as BeerRecipe);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingStyle ? "Edit Recipe" : "Create New Recipe"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Recipe Name"
            required
            error={validationErrors?.find(error => error.field === 'name')?.message}
          >
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormField>

          <FormField
            label="Beverage Type"
            required
          >
            <Select
              value={beverageType}
              onValueChange={(value: BeverageType) => handleBeverageTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select beverage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mead">Mead</SelectItem>
                <SelectItem value="cider">Cider</SelectItem>
                <SelectItem value="beer">Beer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* Render appropriate form sections based on beverage type */}
          {beverageType === 'mead' && <MeadForm formData={formData as MeadRecipe} setFormData={setFormData} />}
          {beverageType === 'cider' && <CiderForm formData={formData as CiderRecipe} setFormData={setFormData} />}
          {beverageType === 'beer' && <BeerForm formData={formData as BeerRecipe} setFormData={setFormData} />}

          {/* Common sections */}
          <CommonSections formData={formData} setFormData={setFormData} validationErrors={validationErrors} />

          <div className="space-y-4">
            <RecipeDocumentUpload
              currentFileName={formData?.recipeDocument?.fileName}
              onFileSelect={async (file) => {
                if (formData?._id) {
                  try {
                    const updatedStyle = await uploadRecipeDocument(formData._id, file);
                    setFormData(prev => ({
                      ...prev,
                      recipeDocument: updatedStyle.recipeDocument
                    }));
                    toast({
                      title: "Success",
                      description: "Recipe document uploaded successfully",
                    });
                  } catch (error) {
                    console.error('Error uploading recipe document:', error);
                    toast({
                      title: "Error",
                      description: "Failed to upload recipe document",
                      variant: "destructive",
                    });
                  }
                }
              }}
              onRemove={async () => {
                if (formData?._id) {
                  try {
                    await deleteRecipeDocument(formData._id);
                    setFormData(prev => ({
                      ...prev,
                      recipeDocument: undefined
                    }));
                    toast({
                      title: "Success",
                      description: "Recipe document removed successfully",
                    });
                  } catch (error) {
                    console.error('Error removing recipe document:', error);
                    toast({
                      title: "Error",
                      description: "Failed to remove recipe document",
                      variant: "destructive",
                    });
                  }
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (editingStyle ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MeadForm({ formData, setFormData }: { formData: MeadRecipe, setFormData: (data: BrewStyle) => void }) {
  return (
    <>
      {/* Pre-Start Requirements */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Pre-Start Requirements</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="honeyTemp">Honey Pre-Heat Temperature (°C)</Label>
            <Input
              id="honeyTemp"
              type="number"
              value={formData.preStartRequirements.honeyPreHeat.temperature}
              onChange={(e) => setFormData({
                ...formData,
                preStartRequirements: {
                  ...formData.preStartRequirements,
                  honeyPreHeat: {
                    ...formData.preStartRequirements.honeyPreHeat,
                    temperature: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="honeyHeatDuration">Pre-Heat Duration (hours)</Label>
            <Input
              id="honeyHeatDuration"
              type="number"
              value={formData.preStartRequirements.honeyPreHeat.duration}
              onChange={(e) => setFormData({
                ...formData,
                preStartRequirements: {
                  ...formData.preStartRequirements,
                  honeyPreHeat: {
                    ...formData.preStartRequirements.honeyPreHeat,
                    duration: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Honey Details */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Honey Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="honeyVariety">Honey Variety</Label>
            <Input
              id="honeyVariety"
              value={formData.honeyReadings.variety}
              onChange={(e) => setFormData({
                ...formData,
                honeyReadings: {
                  ...formData.honeyReadings,
                  variety: e.target.value
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drumCount">Number of Drums</Label>
            <Input
              id="drumCount"
              type="number"
              value={formData.honeyReadings.drumCount}
              onChange={(e) => setFormData({
                ...formData,
                honeyReadings: {
                  ...formData.honeyReadings,
                  drumCount: parseFloat(e.target.value)
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pumpSpeed">Pump Speed (Hz)</Label>
            <Input
              id="pumpSpeed"
              type="number"
              value={formData.honeyReadings.pumpSpeed}
              onChange={(e) => setFormData({
                ...formData,
                honeyReadings: {
                  ...formData.honeyReadings,
                  pumpSpeed: parseFloat(e.target.value)
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Water Addition */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Water Addition</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetVolume">Target Volume (L)</Label>
            <Input
              id="targetVolume"
              type="number"
              value={formData.waterAddition.targetVolume}
              onChange={(e) => setFormData({
                ...formData,
                waterAddition: {
                  ...formData.waterAddition,
                  targetVolume: parseFloat(e.target.value)
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Ozonation</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="o3Used"
                checked={formData.waterAddition.o3Used}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  waterAddition: {
                    ...formData.waterAddition,
                    o3Used: checked as boolean
                  }
                })}
              />
              <label htmlFor="o3Used">Use Ozonated Water</label>
            </div>
          </div>
        </div>
      </div>

      {/* Target Gravity */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Target Gravity</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="originalGravity">Original Gravity</Label>
            <Input
              id="originalGravity"
              type="number"
              step="0.001"
              value={formData.targetGravity.original}
              onChange={(e) => setFormData({
                ...formData,
                targetGravity: {
                  ...formData.targetGravity,
                  original: parseFloat(e.target.value)
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minGravity">Minimum Gravity</Label>
            <Input
              id="minGravity"
              type="number"
              step="0.001"
              value={formData.targetGravity.tolerance.min}
              onChange={(e) => setFormData({
                ...formData,
                targetGravity: {
                  ...formData.targetGravity,
                  tolerance: {
                    ...formData.targetGravity.tolerance,
                    min: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxGravity">Maximum Gravity</Label>
            <Input
              id="maxGravity"
              type="number"
              step="0.001"
              value={formData.targetGravity.tolerance.max}
              onChange={(e) => setFormData({
                ...formData,
                targetGravity: {
                  ...formData.targetGravity,
                  tolerance: {
                    ...formData.targetGravity.tolerance,
                    max: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Nutrients */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Nutrients</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fermaxAmount">Fermax Amount (lbs/drum)</Label>
            <Input
              id="fermaxAmount"
              type="number"
              step="0.1"
              value={formData.nutrients.fermax.initialAmount}
              onChange={(e) => setFormData({
                ...formData,
                nutrients: {
                  ...formData.nutrients,
                  fermax: {
                    ...formData.nutrients.fermax,
                    initialAmount: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mixingDuration">Mixing Duration (minutes)</Label>
            <Input
              id="mixingDuration"
              type="number"
              value={formData.nutrients.fermax.timing.mixingDuration}
              onChange={(e) => setFormData({
                ...formData,
                nutrients: {
                  ...formData.nutrients,
                  fermax: {
                    ...formData.nutrients.fermax,
                    timing: {
                      ...formData.nutrients.fermax.timing,
                      mixingDuration: parseFloat(e.target.value)
                    }
                  }
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Yeast */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Yeast</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yeastType">Type</Label>
            <Input
              id="yeastType"
              value={formData.yeast.type}
              onChange={(e) => setFormData({
                ...formData,
                yeast: {
                  ...formData.yeast,
                  type: e.target.value
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yeastWeight">Weight (kg)</Label>
            <Input
              id="yeastWeight"
              type="number"
              step="0.01"
              value={formData.yeast.weight}
              onChange={(e) => setFormData({
                ...formData,
                yeast: {
                  ...formData.yeast,
                  weight: parseFloat(e.target.value)
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pitchingDelay">Pitching Delay (hours)</Label>
            <Input
              id="pitchingDelay"
              type="number"
              value={formData.yeast.pitchingDelay}
              onChange={(e) => setFormData({
                ...formData,
                yeast: {
                  ...formData.yeast,
                  pitchingDelay: parseFloat(e.target.value)
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Process Steps</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="honeyPumpDuration">Honey Pumping Duration (minutes)</Label>
            <Input
              id="honeyPumpDuration"
              type="number"
              value={formData.processSteps.honeyPumping.duration}
              onChange={(e) => setFormData({
                ...formData,
                processSteps: {
                  ...formData.processSteps,
                  honeyPumping: {
                    ...formData.processSteps.honeyPumping,
                    duration: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mixingDuration">Water Mixing Duration (minutes)</Label>
            <Input
              id="mixingDuration"
              type="number"
              value={formData.processSteps.waterAddition.mixingDuration}
              onChange={(e) => setFormData({
                ...formData,
                processSteps: {
                  ...formData.processSteps,
                  waterAddition: {
                    ...formData.processSteps.waterAddition,
                    mixingDuration: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recircInterval">Recirculation Interval (days)</Label>
            <Input
              id="recircInterval"
              type="number"
              value={formData.processSteps.recirculation.intervalDays}
              onChange={(e) => setFormData({
                ...formData,
                processSteps: {
                  ...formData.processSteps,
                  recirculation: {
                    ...formData.processSteps.recirculation,
                    intervalDays: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function CiderForm({ formData, setFormData }: { formData: CiderRecipe, setFormData: (data: BrewStyle) => void }) {
  const addJuiceVariety = () => {
    const newVariety = {
      name: '',
      percentage: 0
    };
    setFormData({
      ...formData,
      juice: {
        ...formData.juice,
        varieties: [...formData.juice.varieties, newVariety]
      }
    });
  };

  const removeJuiceVariety = (index: number) => {
    setFormData({
      ...formData,
      juice: {
        ...formData.juice,
        varieties: formData.juice.varieties.filter((_, i) => i !== index)
      }
    });
  };

  const updateJuiceVariety = (index: number, field: keyof typeof formData.juice.varieties[0], value: string | number) => {
    const updatedVarieties = [...formData.juice.varieties];
    updatedVarieties[index] = {
      ...updatedVarieties[index],
      [field]: value
    };
    setFormData({
      ...formData,
      juice: {
        ...formData.juice,
        varieties: updatedVarieties
      }
    });
  };

  React.useEffect(() => {
    if (formData.juice.varieties.length === 0) {
      setFormData({
        ...formData,
        juice: {
          ...formData.juice,
          varieties: [{
            name: 'Apple',
            percentage: 100
          }],
          initialGravity: 1.050
        }
      });
    }
  }, []);

  return (
    <>
      <div className="col-span-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Juice Varieties</h3>
            <p className="text-sm text-muted-foreground">At least one juice variety is required</p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addJuiceVariety}
          >
            Add Variety
          </Button>
        </div>
        
        {formData.juice.varieties.length === 0 && (
          <div className="text-red-500 text-sm mb-2">
            At least one juice variety must be added
          </div>
        )}

        {formData.juice.varieties.map((variety, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`juiceVariety-${index}`}>Variety</Label>
                <Input
                  id={`juiceVariety-${index}`}
                  value={variety.name}
                  onChange={(e) => updateJuiceVariety(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`juicePercentage-${index}`}>Percentage (%)</Label>
                <Input
                  id={`juicePercentage-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  value={variety.percentage}
                  onChange={(e) => updateJuiceVariety(index, 'percentage', parseFloat(e.target.value))}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => removeJuiceVariety(index)}
            >
              Remove Variety
            </Button>
          </div>
        ))}
      </div>

      {/* Operation Timing */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Operation Timing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryFermentationDays">Primary Fermentation (days)</Label>
            <Input
              id="primaryFermentationDays"
              type="number"
              value={formData.operationTiming.primaryFermentationDays}
              onChange={(e) => setFormData({
                ...formData,
                operationTiming: { 
                  ...formData.operationTiming, 
                  primaryFermentationDays: parseFloat(e.target.value) 
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryFermentationDays">Secondary Fermentation (days)</Label>
            <Input
              id="secondaryFermentationDays"
              type="number"
              value={formData.operationTiming.secondaryFermentationDays || 0}
              onChange={(e) => setFormData({
                ...formData,
                operationTiming: { 
                  ...formData.operationTiming, 
                  secondaryFermentationDays: parseFloat(e.target.value) 
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clarificationDays">Clarification (days)</Label>
            <Input
              id="clarificationDays"
              type="number"
              value={formData.operationTiming.clarificationDays}
              onChange={(e) => setFormData({
                ...formData,
                operationTiming: { 
                  ...formData.operationTiming, 
                  clarificationDays: parseFloat(e.target.value) 
                }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conditioningDays">Conditioning (days)</Label>
            <Input
              id="conditioningDays"
              type="number"
              value={formData.operationTiming.conditioningDays}
              onChange={(e) => setFormData({
                ...formData,
                operationTiming: { 
                  ...formData.operationTiming, 
                  conditioningDays: parseFloat(e.target.value) 
                }
              })}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function BeerForm({ formData, setFormData }: { formData: BeerRecipe, setFormData: (data: BrewStyle) => void }) {
  const addTempStage = () => {
    const newStage = {
      name: `Stage ${formData.tempStages.length + 1}`,
      temp: 68,
      duration: 24,
      description: ''
    };
    setFormData({
      ...formData,
      tempStages: [...formData.tempStages, newStage]
    });
  };

  const removeTempStage = (index: number) => {
    setFormData({
      ...formData,
      tempStages: formData.tempStages.filter((_, i) => i !== index)
    });
  };

  const updateTempStage = (index: number, field: keyof typeof formData.tempStages[0], value: string | number) => {
    const updatedStages = [...formData.tempStages];
    updatedStages[index] = {
      ...updatedStages[index],
      [field]: value
    };
    setFormData({
      ...formData,
      tempStages: updatedStages
    });
  };

  const addGrain = () => {
    const newGrain = {
      grain: '',
      weight: 0,
      percentage: 0
    };
    setFormData({
      ...formData,
      grainBill: [...formData.grainBill, newGrain]
    });
  };

  const removeGrain = (index: number) => {
    setFormData({
      ...formData,
      grainBill: formData.grainBill.filter((_, i) => i !== index)
    });
  };

  const updateGrain = (index: number, field: keyof typeof formData.grainBill[0], value: string | number) => {
    const updatedGrains = [...formData.grainBill];
    updatedGrains[index] = {
      ...updatedGrains[index],
      [field]: value
    };
    setFormData({
      ...formData,
      grainBill: updatedGrains
    });
  };

  const addHop = () => {
    const newHop = {
      variety: '',
      amount: 0,
      alpha: 0,
      time: 60,
      type: 'bittering' as const
    };
    setFormData({
      ...formData,
      hops: [...formData.hops, newHop]
    });
  };

  const removeHop = (index: number) => {
    setFormData({
      ...formData,
      hops: formData.hops.filter((_, i) => i !== index)
    });
  };

  const updateHop = (index: number, field: keyof typeof formData.hops[0], value: string | number) => {
    const updatedHops = [...formData.hops];
    updatedHops[index] = {
      ...updatedHops[index],
      [field]: value
    };
    setFormData({
      ...formData,
      hops: updatedHops
    });
  };

  React.useEffect(() => {
    if (formData.grainBill.length === 0) {
      setFormData({
        ...formData,
        grainBill: [{
          grain: '2-Row Pale Malt',
          weight: 10,
          percentage: 100
        }]
      });
    }
  }, []);

  return (
    <>
      {/* Grain Bill Section */}
      <div className="col-span-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Grain Bill</h3>
            <p className="text-sm text-muted-foreground">At least one grain is required</p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addGrain}
          >
            Add Grain
          </Button>
        </div>
        
        {formData.grainBill.length === 0 && (
          <div className="text-red-500 text-sm mb-2">
            At least one grain must be added to the grain bill
          </div>
        )}
        
        {formData.grainBill.map((grain, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`grainType-${index}`}>Grain Type</Label>
                <Input
                  id={`grainType-${index}`}
                  value={grain.grain}
                  onChange={(e) => updateGrain(index, 'grain', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`grainWeight-${index}`}>Weight (kg)</Label>
                <Input
                  id={`grainWeight-${index}`}
                  type="number"
                  step="0.1"
                  value={grain.weight}
                  onChange={(e) => updateGrain(index, 'weight', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`grainPercentage-${index}`}>Percentage (%)</Label>
                <Input
                  id={`grainPercentage-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  value={grain.percentage}
                  onChange={(e) => updateGrain(index, 'percentage', parseFloat(e.target.value))}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => removeGrain(index)}
            >
              Remove Grain
            </Button>
          </div>
        ))}
      </div>

      {/* Mash Schedule */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Mash Schedule</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="strikeTemp">Strike Temperature (°F)</Label>
            <Input
              id="strikeTemp"
              type="number"
              value={formData.mash.strikeTemp}
              onChange={(e) => setFormData({
                ...formData,
                mash: { ...formData.mash, strikeTemp: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mashTemp">Mash Temperature (°F)</Label>
            <Input
              id="mashTemp"
              type="number"
              value={formData.mash.mashTemp}
              onChange={(e) => setFormData({
                ...formData,
                mash: { ...formData.mash, mashTemp: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mashTime">Mash Time (minutes)</Label>
            <Input
              id="mashTime"
              type="number"
              value={formData.mash.mashTime}
              onChange={(e) => setFormData({
                ...formData,
                mash: { ...formData.mash, mashTime: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spargeTemp">Sparge Temperature (°F)</Label>
            <Input
              id="spargeTemp"
              type="number"
              value={formData.mash.spargeTemp}
              onChange={(e) => setFormData({
                ...formData,
                mash: { ...formData.mash, spargeTemp: parseFloat(e.target.value) }
              })}
            />
          </div>
        </div>
      </div>

      {/* Water Profile */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Water Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mashVolume">Mash Volume (L)</Label>
            <Input
              id="mashVolume"
              type="number"
              step="0.1"
              value={formData.water.mashVolume}
              onChange={(e) => setFormData({
                ...formData,
                water: { ...formData.water, mashVolume: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spargeVolume">Sparge Volume (L)</Label>
            <Input
              id="spargeVolume"
              type="number"
              step="0.1"
              value={formData.water.spargeVolume}
              onChange={(e) => setFormData({
                ...formData,
                water: { ...formData.water, spargeVolume: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waterPH">Target pH</Label>
            <Input
              id="waterPH"
              type="number"
              step="0.1"
              value={formData.water.targetProfile.pH}
              onChange={(e) => setFormData({
                ...formData,
                water: { 
                  ...formData.water, 
                  targetProfile: {
                    ...formData.water.targetProfile,
                    pH: parseFloat(e.target.value)
                  }
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Hop Schedule */}
      <div className="col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Hop Schedule</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addHop}
          >
            Add Hop
          </Button>
        </div>
        
        {formData.hops.map((hop, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`hopVariety-${index}`}>Variety</Label>
                <Input
                  id={`hopVariety-${index}`}
                  value={hop.variety}
                  onChange={(e) => updateHop(index, 'variety', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`hopAmount-${index}`}>Amount (g)</Label>
                <Input
                  id={`hopAmount-${index}`}
                  type="number"
                  step="0.1"
                  value={hop.amount}
                  onChange={(e) => updateHop(index, 'amount', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`hopAlpha-${index}`}>Alpha Acid (%)</Label>
                <Input
                  id={`hopAlpha-${index}`}
                  type="number"
                  step="0.1"
                  value={hop.alpha}
                  onChange={(e) => updateHop(index, 'alpha', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`hopTime-${index}`}>Time (minutes)</Label>
                <Input
                  id={`hopTime-${index}`}
                  type="number"
                  value={hop.time}
                  onChange={(e) => updateHop(index, 'time', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`hopType-${index}`}>Addition Type</Label>
                <Select
                  value={hop.type}
                  onValueChange={(value) => updateHop(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bittering">Bittering</SelectItem>
                    <SelectItem value="flavor">Flavor</SelectItem>
                    <SelectItem value="aroma">Aroma</SelectItem>
                    <SelectItem value="dryHop">Dry Hop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => removeHop(index)}
            >
              Remove Hop
            </Button>
          </div>
        ))}
      </div>

      {/* Style Metrics */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Style Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ibu">IBU</Label>
            <Input
              id="ibu"
              type="number"
              value={formData.style.ibu}
              onChange={(e) => setFormData({
                ...formData,
                style: { ...formData.style, ibu: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="srm">SRM (Color)</Label>
            <Input
              id="srm"
              type="number"
              value={formData.style.srm}
              onChange={(e) => setFormData({
                ...formData,
                style: { ...formData.style, srm: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="abv">Target ABV (%)</Label>
            <Input
              id="abv"
              type="number"
              step="0.1"
              value={formData.style.abv}
              onChange={(e) => setFormData({
                ...formData,
                style: { ...formData.style, abv: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og">Original Gravity</Label>
            <Input
              id="og"
              type="number"
              step="0.001"
              value={formData.style.og}
              onChange={(e) => setFormData({
                ...formData,
                style: { ...formData.style, og: parseFloat(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fg">Final Gravity</Label>
            <Input
              id="fg"
              type="number"
              step="0.001"
              value={formData.style.fg}
              onChange={(e) => setFormData({
                ...formData,
                style: { ...formData.style, fg: parseFloat(e.target.value) }
              })}
            />
          </div>
        </div>
      </div>

      {/* Temperature Stages */}
      <div className="col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Temperature Stages</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addTempStage}
          >
            Add Stage
          </Button>
        </div>
        
        {formData.tempStages.map((stage, index) => (
          <div key={index} className="mb-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`stageName-${index}`}>Stage Name</Label>
                <Input
                  id={`stageName-${index}`}
                  value={stage.name}
                  onChange={(e) => updateTempStage(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`stageTemp-${index}`}>Temperature (°F)</Label>
                <Input
                  id={`stageTemp-${index}`}
                  type="number"
                  value={stage.temp}
                  onChange={(e) => updateTempStage(index, 'temp', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`stageDuration-${index}`}>Duration (hours)</Label>
                <Input
                  id={`stageDuration-${index}`}
                  type="number"
                  value={stage.duration}
                  onChange={(e) => updateTempStage(index, 'duration', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`stageDescription-${index}`}>Description</Label>
                <Input
                  id={`stageDescription-${index}`}
                  value={stage.description || ''}
                  onChange={(e) => updateTempStage(index, 'description', e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => removeTempStage(index)}
            >
              Remove Stage
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

function CommonSections({ formData, setFormData, validationErrors }: { 
  formData: BrewStyle, 
  setFormData: (data: BrewStyle) => void,
  validationErrors: ValidationError[]
}) {
  return (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Temperature Control</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Fermentation Temperature (°F)"
            required
            error={validationErrors.find(error => error.field === 'fermentation-temp')?.message}
          >
            <Input
              id="fermentationTemp"
              type="number"
              value={formData.temperature.fermentation}
              onChange={(e) => setFormData({
                ...formData,
                temperature: { ...formData.temperature, fermentation: parseFloat(e.target.value) }
              })}
              min="32"
              max="100"
            />
          </FormField>
          <FormField
            label="Crash Temperature (°F)"
            required
            error={validationErrors.find(error => error.field === 'crash-temp')?.message}
          >
            <Input
              id="crashTemp"
              type="number"
              value={formData.temperature.crash}
              onChange={(e) => setFormData({
                ...formData,
                temperature: { ...formData.temperature, crash: parseFloat(e.target.value) }
              })}
              min="32"
              max="100"
            />
          </FormField>
        </div>
      </div>

      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Yeast Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            label="Yeast Type"
            required
            error={validationErrors.find(error => error.field === 'yeast-type')?.message}
          >
            <Input
              id="yeastType"
              value={formData.yeast.type}
              onChange={(e) => setFormData({
                ...formData,
                yeast: { ...formData.yeast, type: e.target.value }
              })}
              placeholder="e.g., Lalvin D47"
            />
          </FormField>
          <FormField
            label="Yeast Weight (kg)"
            required
            error={validationErrors.find(error => error.field === 'yeast-weight')?.message}
          >
            <Input
              id="yeastWeight"
              type="number"
              step="0.01"
              value={formData.yeast.weight}
              onChange={(e) => setFormData({
                ...formData,
                yeast: { ...formData.yeast, weight: parseFloat(e.target.value) }
              })}
              min="0"
            />
          </FormField>
          <FormField
            label="Pitching Delay (hours)"
            required
            error={validationErrors.find(error => error.field === 'pitching-delay')?.message}
          >
            <Input
              id="pitchingDelay"
              type="number"
              value={formData.yeast.pitchingDelay}
              onChange={(e) => setFormData({
                ...formData,
                yeast: { ...formData.yeast, pitchingDelay: parseFloat(e.target.value) }
              })}
              min="0"
              max="72"
            />
          </FormField>
        </div>
      </div>

      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4">Operation Timing</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Primary Fermentation (days)"
            required
            error={validationErrors.find(error => error.field === 'primary-fermentation')?.message}
          >
            <Input
              id="primaryFermentation"
              type="number"
              value={formData.operationTiming.primaryFermentationDays}
              onChange={(e) => setFormData({
                ...formData,
                operationTiming: {
                  ...formData.operationTiming,
                  primaryFermentationDays: parseFloat(e.target.value)
                }
              })}
              min="1"
            />
          </FormField>
          <FormField
            label="Clarification (days)"
            required
            error={validationErrors.find(error => error.field === 'clarification-days')?.message}
          >
            <Input
              id="clarification"
              type="number"
              value={formData.operationTiming.clarificationDays}
              onChange={(e) => setFormData({
                ...formData,
                operationTiming: {
                  ...formData.operationTiming,
                  clarificationDays: parseFloat(e.target.value)
                }
              })}
              min="1"
            />
          </FormField>
          <FormField
            label="Conditioning (days)"
            required
            error={validationErrors.find(error => error.field === 'conditioning-days')?.message}
          >
            <Input
              id="conditioning"
              type="number"
              value={formData.operationTiming.conditioningDays}
              onChange={(e) => setFormData({
                ...formData,
                operationTiming: {
                  ...formData.operationTiming,
                  conditioningDays: parseFloat(e.target.value)
                }
              })}
              min="1"
            />
          </FormField>
        </div>
      </div>
    </>
  );
} 