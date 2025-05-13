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
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { LOCATIONS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  vehicleType: z.enum(["car", "bike"]),
  vehicleModel: z.string().min(2, "Vehicle model is required"),
  registrationNumber: z.string().min(5, "Valid registration number is required"),
  pickupLocation: z.string().min(2, "Pickup location is required"),
  dropLocation: z.string().min(2, "Drop location is required"),
  insuranceExpiryDate: z.string().min(2, "Insurance expiry date is required"),
  // We'll handle the file upload separately
});

type FormValues = z.infer<typeof formSchema>;

export default function ShiftRequest() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleType: "car",
      vehicleModel: "",
      registrationNumber: "",
      pickupLocation: "",
      dropLocation: "",
      insuranceExpiryDate: "",
    },
  });

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
      
      // For now, simulate a request
      await apiRequest("POST", "/api/shift-requests", {
        ...data,
        photoUploaded: !!photoFile,
      });

      toast({
        title: "Request Submitted",
        description: "Your vehicle shift request has been submitted successfully.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/shift-requests"] });
      
      // Navigate back to home
      navigate("/");
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

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <Header title="Shift Your Vehicle" showBackButton variant="primary" />

      <div className="px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="mb-6">
              <h2 className="font-bold text-lg mb-4">Vehicle Details</h2>

              {/* Vehicle Type Selection */}
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="block text-neutral-700 mb-2 font-medium">Vehicle Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div className={`border rounded-lg p-3 flex items-center cursor-pointer ${field.value === "car" ? "border-primary-500 bg-primary-50" : "border-neutral-300"}`}>
                          <RadioGroupItem value="car" id="car" className="mr-2" />
                          <Label htmlFor="car" className="flex items-center cursor-pointer">
                            <i className={`fas fa-car ${field.value === "car" ? "text-primary-500" : "text-neutral-500"} mr-2`}></i>
                            <span>Car</span>
                          </Label>
                        </div>
                        <div className={`border rounded-lg p-3 flex items-center cursor-pointer ${field.value === "bike" ? "border-primary-500 bg-primary-50" : "border-neutral-300"}`}>
                          <RadioGroupItem value="bike" id="bike" className="mr-2" />
                          <Label htmlFor="bike" className="flex items-center cursor-pointer">
                            <i className={`fas fa-motorcycle ${field.value === "bike" ? "text-primary-500" : "text-neutral-500"} mr-2`}></i>
                            <span>Bike</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Model */}
              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="block text-neutral-700 mb-2 font-medium">Vehicle Model</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Honda City, Royal Enfield Classic"
                        {...field}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </FormControl>
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

              {/* Additional Details */}
              <h2 className="font-bold text-lg mb-4 mt-8">Additional Details</h2>

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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium mt-6 hover:bg-primary-600"
                disabled={isUploading}
              >
                {isUploading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <BottomNav />
    </div>
  );
}
