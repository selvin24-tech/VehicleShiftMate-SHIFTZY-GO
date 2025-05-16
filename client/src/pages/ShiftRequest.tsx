import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { LOCATIONS, DETAILED_VEHICLE_TYPES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { CircleCheck, ChevronLeft } from "lucide-react";

const formSchema = z.object({
  vehicleType: z.enum(["car", "bike", "suv", "luxury"]).optional().refine(val => val !== undefined, {
    message: "Please select a vehicle type"
  }),
  vehicleModel: z.string().min(2, "Vehicle model is required"),
  registrationNumber: z.string().min(5, "Valid registration number is required"),
  pickupLocation: z.string().min(2, "Pickup location is required"),
  dropLocation: z.string().min(2, "Drop location is required"),
  insuranceExpiryDate: z.string().min(2, "Insurance expiry date is required"),
  // We'll handle the file upload separately
  luxuryBrand: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ShiftRequest() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleType: undefined, // Start with no vehicle type selected
      vehicleModel: "",
      registrationNumber: "",
      pickupLocation: "",
      dropLocation: "",
      insuranceExpiryDate: "",
      luxuryBrand: "",
    },
  });
  
  // State to track if we should show the luxury brand field
  const [showLuxuryField, setShowLuxuryField] = useState(false);
  
  // State to track the selected vehicle type for the detailed dropdown
  const [selectedVehicleType, setSelectedVehicleType] = useState<"car" | "bike" | "suv" | "luxury" | null>(null);
  
  // Get the vehicle models for the currently selected type
  const vehicleModels = selectedVehicleType ? DETAILED_VEHICLE_TYPES[selectedVehicleType] || [] : [];
  
  // Function to change vehicle type
  const changeVehicleType = (type: "car" | "bike" | "suv" | "luxury") => {
    form.setValue("vehicleType", type);
    setShowLuxuryField(type === "luxury");
    setSelectedVehicleType(type);
    form.setValue("vehicleModel", "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsUploading(true);
      // Here you would typically upload the photo to a server
      // and then submit the form data with the photo URL
      
      // Prepare the submission data
      const submissionData = {
        ...data,
        photoUploaded: !!photoFile,
      };
      
      // If it's not a luxury vehicle, remove the luxury brand field
      if (data.vehicleType !== "luxury") {
        delete submissionData.luxuryBrand;
      }
      
      // For now, simulate a request
      await apiRequest("POST", "/api/shift-requests", submissionData);

      // Show success dialog instead of toast
      setShowSuccessDialog(true);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/shift-requests"] });
      
      // Don't navigate immediately, let the user see the success message
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle navigation after success
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <Header title="Shift Your Vehicle" showAnimation={true} />
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="default" 
          size="default"
          onClick={() => navigate("/")}
          className="bg-primary-600 text-white shadow-lg hover:bg-primary-700 flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="font-medium text-base">Back</span>
        </Button>
      </div>

      <div className="px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20">
            <div className="mb-6">
              <h2 className="font-bold text-lg mb-4">Vehicle Details</h2>

              {/* Vehicle Type Selection - Enhanced Version */}
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel className="block text-neutral-700 font-medium">Vehicle Type</FormLabel>
                      {selectedVehicleType && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedVehicleType(null)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium p-0"
                        >
                          Change
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      {selectedVehicleType ? (
                        // Show only the selected option with enhanced graphics
                        <div className="bg-white rounded-xl shadow-md p-4 border-2 border-primary-200">
                          <div className="flex items-start">
                            <div className="bg-primary-50 rounded-full p-4 mr-4">
                              {selectedVehicleType === "car" && <span className="text-4xl">🚗</span>}
                              {selectedVehicleType === "bike" && <span className="text-4xl">🏍️</span>}
                              {selectedVehicleType === "suv" && <span className="text-4xl">🚙</span>}
                              {selectedVehicleType === "luxury" && <span className="text-4xl">✨</span>}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg mb-1">
                                {selectedVehicleType === "car" && "Car"}
                                {selectedVehicleType === "bike" && "Bike"}
                                {selectedVehicleType === "suv" && "SUV"}
                                {selectedVehicleType === "luxury" && "Premium"}
                              </h3>
                              <p className="text-sm text-neutral-600 mb-2">
                                {selectedVehicleType === "car" && "Sedans, Hatchbacks – Daily ride, easy to shift"}
                                {selectedVehicleType === "bike" && "Scooters, Motorbikes – Lightweight and quick move"}
                                {selectedVehicleType === "suv" && "Big, Bold & Spacious – Great for road trips & families"}
                                {selectedVehicleType === "luxury" && "Top-end vehicles for a signature travel experience"}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedVehicleType === "car" && (
                                  <>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">5 Seater</span>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Compact</span>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Fuel Efficient</span>
                                  </>
                                )}
                                {selectedVehicleType === "bike" && (
                                  <>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">1-2 Seater</span>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Low Cost</span>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Fast Delivery</span>
                                  </>
                                )}
                                {selectedVehicleType === "suv" && (
                                  <>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">7 Seater</span>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Spacious</span>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Road Trip</span>
                                  </>
                                )}
                                {selectedVehicleType === "luxury" && (
                                  <>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Premium</span>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Comfort</span>
                                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">High-End</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Show selection grid when no option is selected
                        <RadioGroup
                          onValueChange={(value) => {
                            const vehicleType = value as "car" | "bike" | "suv" | "luxury";
                            changeVehicleType(vehicleType);
                          }}
                          value={selectedVehicleType || undefined}
                          className="vehicle-type-options grid grid-cols-2 gap-3"
                        >
                          <div 
                            className="vehicle-option rounded-xl overflow-hidden shadow transition-all bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                            onClick={() => {
                              changeVehicleType("car");
                            }}
                          >
                            <div className="p-4 flex flex-col items-center text-center">
                              <RadioGroupItem value="car" id="car" className="sr-only" />
                              <span className="text-3xl mb-2">🚗</span>
                              <h3 className="font-semibold text-base mb-1">Car</h3>
                              <p className="text-xs text-neutral-600">Sedans, Hatchbacks – Daily ride, easy to shift</p>
                            </div>
                          </div>
                          
                          <div 
                            className="vehicle-option rounded-xl overflow-hidden shadow transition-all bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                            onClick={() => {
                              changeVehicleType("bike");
                            }}
                          >
                            <div className="p-4 flex flex-col items-center text-center">
                              <RadioGroupItem value="bike" id="bike" className="sr-only" />
                              <span className="text-3xl mb-2">🏍️</span>
                              <h3 className="font-semibold text-base mb-1">Bike</h3>
                              <p className="text-xs text-neutral-600">Scooters, Motorbikes – Lightweight and quick move</p>
                            </div>
                          </div>
                          
                          <div 
                            className="vehicle-option rounded-xl overflow-hidden shadow transition-all bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                            onClick={() => {
                              changeVehicleType("suv");
                            }}
                          >
                            <div className="p-4 flex flex-col items-center text-center">
                              <RadioGroupItem value="suv" id="suv" className="sr-only" />
                              <span className="text-3xl mb-2">🚙</span>
                              <h3 className="font-semibold text-base mb-1">SUV</h3>
                              <p className="text-xs text-neutral-600">Big, Bold & Spacious – Great for road trips & families</p>
                            </div>
                          </div>
                          
                          <div 
                            className="vehicle-option rounded-xl overflow-hidden shadow transition-all bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                            onClick={() => {
                              changeVehicleType("luxury");
                            }}
                          >
                            <div className="p-4 flex flex-col items-center text-center">
                              <RadioGroupItem value="luxury" id="luxury" className="sr-only" />
                              <span className="text-3xl mb-2">✨</span>
                              <h3 className="font-semibold text-base mb-1">Premium</h3>
                              <p className="text-xs text-neutral-600">Top-end vehicles for a signature travel experience</p>
                            </div>
                          </div>
                        </RadioGroup>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Luxury Brand - Only shown when Luxury is selected */}
              {showLuxuryField && (
                <FormField
                  control={form.control}
                  name="luxuryBrand"
                  render={({ field }) => (
                    <FormItem className="mb-5">
                      <FormLabel className="block text-neutral-700 mb-2 font-medium">Luxury Brand</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select Brand</option>
                          {/* Hard-coded unique luxury brands from the data */}
                          <option value="BMW">BMW</option>
                          <option value="Audi">Audi</option>
                          <option value="Mercedes">Mercedes</option>
                          <option value="Jaguar">Jaguar</option>
                          <option value="Land">Land Rover</option>
                          <option value="Lexus">Lexus</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormControl>
                      <p className="text-xs text-neutral-500 mt-1">
                        Select the brand of your luxury vehicle
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Vehicle Model */}
              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="block text-neutral-700 mb-2 font-medium">Vehicle Model</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select a vehicle model</option>
                        {vehicleModels.map((model: any, index: number) => (
                          <option 
                            key={index} 
                            value={`${model.name} (${model.model})`}
                          >
                            {model.name} - {model.model} ({model.range})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <p className="text-xs text-neutral-500 mt-1">
                      {selectedVehicleType 
                        ? `Select from available ${selectedVehicleType} models ranging from Economy to Luxury`
                        : "Select a vehicle type first, then choose a model"
                      }
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Registration Number */}
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="block text-neutral-700 mb-2 font-medium">Registration Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. TN 01 AB 1234"
                        {...field}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Details */}
              <h2 className="font-bold text-lg mb-4 mt-8">Location Details</h2>

              {/* Pickup Location */}
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="block text-neutral-700 mb-2 font-medium">Pickup Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <i className="fas fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"></i>
                        <select
                          {...field}
                          className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                          <option value="">Select pickup location</option>
                          {LOCATIONS.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Drop Location */}
              <FormField
                control={form.control}
                name="dropLocation"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="block text-neutral-700 mb-2 font-medium">Drop Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <i className="fas fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"></i>
                        <select
                          {...field}
                          className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                          <option value="">Select drop location</option>
                          {LOCATIONS.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Insurance Expiry Date */}
              <FormField
                control={form.control}
                name="insuranceExpiryDate"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="block text-neutral-700 mb-2 font-medium">Insurance Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Photo Upload */}
              <div className="mb-5">
                <Label className="block text-neutral-700 mb-2 font-medium">Vehicle Photo</Label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                  {photoPreview ? (
                    <div className="mb-4">
                      <img src={photoPreview} alt="Vehicle preview" className="max-h-48 mx-auto" />
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-camera text-neutral-400 text-3xl mb-2"></i>
                      <p className="text-neutral-500 mb-2">Upload a photo of your vehicle</p>
                    </>
                  )}
                  <label htmlFor="photo-upload" className="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 cursor-pointer inline-block">
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Preview Section */}
              {selectedVehicleType && form.getValues('vehicleModel') && form.getValues('pickupLocation') && form.getValues('dropLocation') && (
                <div className="mt-8 mb-4">
                  <h2 className="font-bold text-lg mb-4">Preview</h2>
                  <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                    <div className="flex items-center mb-3">
                      <div className="bg-white rounded-full p-2 mr-3">
                        {selectedVehicleType === "car" && <span className="text-2xl">🚗</span>}
                        {selectedVehicleType === "bike" && <span className="text-2xl">🏍️</span>}
                        {selectedVehicleType === "suv" && <span className="text-2xl">🚙</span>}
                        {selectedVehicleType === "luxury" && <span className="text-2xl">✨</span>}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">
                          {selectedVehicleType === "car" && "Car"}
                          {selectedVehicleType === "bike" && "Bike"}
                          {selectedVehicleType === "suv" && "SUV"}
                          {selectedVehicleType === "luxury" && "Premium"}
                          {" - "}{form.getValues('vehicleModel')}
                        </h3>
                        <p className="text-xs text-neutral-600">{form.getValues('registrationNumber')}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 text-sm border-t border-primary-100 pt-3">
                      <div className="flex">
                        <span className="font-medium w-28">Pickup:</span>
                        <span>{form.getValues('pickupLocation')}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-28">Drop:</span>
                        <span>{form.getValues('dropLocation')}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-28">Insurance:</span>
                        <span>{form.getValues('insuranceExpiryDate')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="sticky bottom-6 left-0 right-0 bg-white pt-4 pb-2 px-4 mt-6 shadow-lg rounded-t-2xl">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-6 rounded-lg font-medium text-lg hover:from-primary-700 hover:to-primary-600 transition-all"
                  disabled={isUploading}
                >
                  {isUploading ? "Submitting..." : "Submit Vehicle Shift Request"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 mb-4">
              <CircleCheck className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">Request Submitted Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Your vehicle shift request has been submitted. We'll notify you when someone accepts your request.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-neutral-50 rounded-lg mb-4">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="inline-block bg-primary-100 text-primary-700 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                <span>Travelers will browse available vehicles and may select yours</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block bg-primary-100 text-primary-700 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                <span>You'll get notified when someone accepts your request</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block bg-primary-100 text-primary-700 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                <span>Connect with the traveler to arrange the pickup</span>
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={handleSuccessClose} className="w-full">
              Return to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}