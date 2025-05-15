import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TripCard from "@/components/common/TripCard";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { USER_PROFILE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Settings, HelpCircle, Shield, LogOut, Car, Bike, ChevronRight, Star } from "lucide-react";

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleAddVehicle = () => {
    toast({
      title: "Add Vehicle",
      description: "Add vehicle functionality coming soon!",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6 pb-16 relative">
        <div className="flex items-center">
          <button
            className="mr-3"
            aria-label="Back"
            onClick={() => navigate("/")}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </div>
      
      {/* Profile Card */}
      <div className="relative px-4">
        <Card className="bg-white rounded-xl shadow-lg p-4 -mt-12 flex items-center">
          <Avatar className="w-16 h-16 mr-4 border-2 border-white">
            <AvatarImage src={USER_PROFILE.avatarUrl} alt={USER_PROFILE.name} />
            <AvatarFallback>{USER_PROFILE.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">{USER_PROFILE.name}</h2>
            <p className="text-sm text-neutral-500">{USER_PROFILE.phone}</p>
            <Button variant="link" className="text-primary-600 text-sm p-0 h-auto mt-1">Edit Profile</Button>
          </div>
        </Card>
      </div>
      
      {/* Profile Sections */}
      <div className="px-4 py-6">
        {/* Personal Details */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Personal Details</h3>
          <Card className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-envelope text-neutral-500 w-6"></i>
                <span className="ml-3">Email</span>
              </div>
              <div className="text-neutral-700">{USER_PROFILE.email}</div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-id-card text-neutral-500 w-6"></i>
                <span className="ml-3">ID Verification</span>
              </div>
              <div className="text-green-600 flex items-center">
                <span>Verified</span>
                <i className="fas fa-check-circle ml-1"></i>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-neutral-500 w-6"></i>
                <span className="ml-3">Address</span>
              </div>
              <div className="text-neutral-700">{USER_PROFILE.address}</div>
            </div>
          </Card>
        </div>
        
        {/* My Vehicles */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">My Vehicles</h3>
            <Button 
              variant="link" 
              className="text-primary-600 text-sm p-0 h-auto"
              onClick={handleAddVehicle}
            >
              Add New
            </Button>
          </div>
          
          {USER_PROFILE.vehicles?.map((vehicle) => (
            <Card 
              key={vehicle.id} 
              className="bg-white rounded-lg border border-neutral-200 p-4 mb-3 cursor-pointer hover:border-secondary-300 transition-all"
              onClick={() => navigate(`/vehicle/${vehicle.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-full p-2 mr-3">
                    {vehicle.type === 'car' ? 
                      <Car className="text-primary-500" /> : 
                      <Bike className="text-primary-500" />
                    }
                  </div>
                  <div>
                    <h4 className="font-semibold">{vehicle.make} {vehicle.model}</h4>
                    <p className="text-xs text-neutral-500">{vehicle.registrationNumber}</p>
                  </div>
                </div>
                <ChevronRight className="text-neutral-400 h-5 w-5" />
              </div>
            </Card>
          ))}
        </div>
        
        {/* History Section */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Travel History</h3>
          {USER_PROFILE.trips?.map((trip) => (
            <TripCard key={trip.id} trip={trip} showDetails />
          ))}
        </div>
        
        {/* Reviews Section */}
        <div className="mb-6">
          <ReviewsSection 
            type="user" 
            id={parseInt(USER_PROFILE.id)}
            title="My Reviews"
            showForm={false}
          />
        </div>
        
        {/* Settings & Help Section */}
        <Card className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
          <button className="w-full p-4 flex items-center justify-between text-left">
            <div className="flex items-center">
              <Settings className="text-neutral-500 w-6 h-6" />
              <span className="ml-3">Settings</span>
            </div>
            <ChevronRight className="text-neutral-400 w-5 h-5" />
          </button>
          <button className="w-full p-4 flex items-center justify-between text-left">
            <div className="flex items-center">
              <HelpCircle className="text-neutral-500 w-6 h-6" />
              <span className="ml-3">Help & Support</span>
            </div>
            <ChevronRight className="text-neutral-400 w-5 h-5" />
          </button>
          <button className="w-full p-4 flex items-center justify-between text-left">
            <div className="flex items-center">
              <Shield className="text-neutral-500 w-6 h-6" />
              <span className="ml-3">Privacy & Terms</span>
            </div>
            <ChevronRight className="text-neutral-400 w-5 h-5" />
          </button>
          <button 
            className="w-full p-4 flex items-center text-red-500 text-left"
            onClick={handleLogout}
          >
            <LogOut className="w-6 h-6" />
            <span className="ml-3">Logout</span>
          </button>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
}
