import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/layout/AdminHeader";
import { CheckCircle2, XCircle, Clock, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface PendingRequest {
  id: number;
  owner: string;
  vehicle: string;
  regNo: string;
  route: string;
  requestedOn: string;
  insurance: string;
  status: ApprovalStatus;
}

const INITIAL_PENDING: PendingRequest[] = [
  { id: 1, owner: "Ramesh V.", vehicle: "Honda City", regNo: "TN09AB1234", route: "Chennai → Bangalore", requestedOn: "Today, 09:12 AM", insurance: "Valid till Dec 2026", status: "pending" },
  { id: 2, owner: "Kavitha S.", vehicle: "Maruti Swift", regNo: "TN22CD5678", route: "Coimbatore → Chennai", requestedOn: "Today, 08:45 AM", insurance: "Valid till Mar 2027", status: "pending" },
  { id: 3, owner: "Prakash N.", vehicle: "Hyundai Creta", regNo: "TN45EF9012", route: "Madurai → Trichy", requestedOn: "Yesterday, 11:30 PM", insurance: "Valid till Jun 2027", status: "pending" },
  { id: 4, owner: "Divya M.", vehicle: "Toyota Innova", regNo: "TN01GH3456", route: "Delhi → Gurgaon", requestedOn: "Yesterday, 07:00 PM", insurance: "Valid till Aug 2026", status: "pending" },
  { id: 5, owner: "Suresh K.", vehicle: "Bajaj Pulsar", regNo: "TN56IJ7890", route: "Puducherry → Chennai", requestedOn: "2 days ago", insurance: "Expired — flagged", status: "pending" },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(INITIAL_PENDING);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);

  const operationalStats = {
    totalUsers: 4370,
    activeCustomers: 2847,
    activeTravelers: 1523,
    ongoingShifts: 234,
    completedToday: 67,
    pendingApprovals: pendingRequests.filter(r => r.status === "pending").length,
    revenue: { today: 45600, thisWeek: 189300, thisMonth: 756200 },
    shiftTypes: {
      local: { active: 156, completed: 89, pending: 12 },
      interstate: { active: 89, completed: 45, pending: 11 }
    }
  };

  const recentActivities = [
    { id: 1, type: "shift_completed", user: "Rajesh Kumar", vehicle: "Honda City", time: "2 mins ago", amount: "₹3,200" },
    { id: 2, type: "new_registration", user: "Priya Sharma", time: "5 mins ago", location: "Mumbai" },
    { id: 3, type: "payment_received", user: "Amit Singh", time: "8 mins ago", amount: "₹2,800" },
    { id: 4, type: "shift_started", user: "Neha Gupta", vehicle: "Maruti Swift", time: "12 mins ago" },
    { id: 5, type: "customer_support", user: "Vikram Patel", issue: "Payment Issue", time: "15 mins ago" }
  ];

  const activeShifts = [
    { id: 1, customer: "Arjun Reddy", traveler: "Karthik S", route: "Chennai → Bangalore", vehicle: "Toyota Innova", status: "in_transit", progress: 65 },
    { id: 2, customer: "Deepika M", traveler: "Rahul T", route: "Mumbai → Pune", vehicle: "Honda Amaze", status: "in_transit", progress: 30 },
    { id: 3, customer: "Suresh K", traveler: "Anita R", route: "Delhi → Gurgaon", vehicle: "Hyundai i20", status: "starting", progress: 10 },
    { id: 4, customer: "Meera S", traveler: "Vijay N", route: "Kolkata → Durgapur", vehicle: "Maruti Dzire", status: "in_transit", progress: 80 }
  ];

  const handleApprove = (id: number) => {
    setPendingRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
    setSelectedRequest(null);
    toast({ title: "Request Approved ✅", description: "The shift request has been approved and the owner notified." });
  };

  const handleReject = (id: number, reason?: string) => {
    setPendingRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
    setSelectedRequest(null);
    toast({ title: "Request Rejected", description: reason || "The shift request has been rejected.", variant: "destructive" });
  };

  const pendingCount = pendingRequests.filter(r => r.status === "pending").length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminHeader />
      <div className="container max-w-6xl mx-auto px-6 pb-8">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <i className="fas fa-users text-blue-600"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operationalStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ongoing Shifts</CardTitle>
              <i className="fas fa-route text-green-600"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operationalStats.ongoingShifts}</div>
              <p className="text-xs text-muted-foreground">Real-time active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <i className="fas fa-rupee-sign text-yellow-600"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{operationalStats.revenue.today.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>

          <Card className={pendingCount > 0 ? "border-orange-300 bg-orange-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              {pendingCount > 0 ? <AlertTriangle className="w-4 h-4 text-orange-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pendingCount > 0 ? "text-orange-600" : "text-green-600"}`}>{pendingCount}</div>
              <p className="text-xs text-muted-foreground">{pendingCount > 0 ? "Requires attention" : "All clear!"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="approvals" className="relative">
              Approvals
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{pendingCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shifts">Active Shifts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* ── APPROVALS TAB ── */}
          <TabsContent value="approvals" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Shift Request Approvals</h2>
                <p className="text-sm text-gray-500">Review and approve or reject incoming shift requests</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full">{pendingRequests.filter(r => r.status === "pending").length} Pending</span>
                <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">{pendingRequests.filter(r => r.status === "approved").length} Approved</span>
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full">{pendingRequests.filter(r => r.status === "rejected").length} Rejected</span>
              </div>
            </div>

            <div className="space-y-3">
              {pendingRequests.map(req => (
                <Card key={req.id} className={`${req.status === "approved" ? "border-green-200 bg-green-50/50" : req.status === "rejected" ? "border-red-200 bg-red-50/50 opacity-70" : "border-orange-200"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm">{req.owner} — {req.vehicle}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === "pending" ? "bg-orange-100 text-orange-700" :
                            req.status === "approved" ? "bg-green-100 text-green-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {req.status === "pending" ? "⏳ Pending" : req.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                          </span>
                          {req.insurance.includes("Expired") && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">⚠ Insurance Expired</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          <span>Reg: <strong className="text-gray-700">{req.regNo}</strong></span>
                          <span>Route: <strong className="text-gray-700">{req.route}</strong></span>
                          <span>Insurance: <strong className={req.insurance.includes("Expired") ? "text-red-600" : "text-gray-700"}>{req.insurance}</strong></span>
                          <span>Submitted: <strong className="text-gray-700">{req.requestedOn}</strong></span>
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" onClick={() => handleApprove(req.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-1 h-8 px-3">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(req.id, req.insurance.includes("Expired") ? "Rejected: Insurance expired." : undefined)}
                            className="border-red-300 text-red-600 hover:bg-red-50 gap-1 h-8 px-3">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                      {req.status === "approved" && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
                      {req.status === "rejected" && <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest platform activities and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'shift_completed' ? 'bg-green-500' :
                            activity.type === 'new_registration' ? 'bg-blue-500' :
                            activity.type === 'payment_received' ? 'bg-yellow-500' :
                            activity.type === 'shift_started' ? 'bg-purple-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium">{activity.user}</p>
                            <p className="text-xs text-gray-500">{activity.type.replace('_', ' ')} • {activity.time}</p>
                          </div>
                        </div>
                        {activity.amount && <Badge variant="outline" className="text-green-600">{activity.amount}</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shift Distribution</CardTitle>
                  <CardDescription>Local vs Interstate breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Local Shifts</span>
                        <span className="text-sm text-gray-600">{operationalStats.shiftTypes.local.active} active</span>
                      </div>
                      <Progress value={65} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Completed: {operationalStats.shiftTypes.local.completed}</span>
                        <span>Pending: {operationalStats.shiftTypes.local.pending}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Interstate Shifts</span>
                        <span className="text-sm text-gray-600">{operationalStats.shiftTypes.interstate.active} active</span>
                      </div>
                      <Progress value={35} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Completed: {operationalStats.shiftTypes.interstate.completed}</span>
                        <span>Pending: {operationalStats.shiftTypes.interstate.pending}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shifts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Shifts Monitor</CardTitle>
                <CardDescription>Real-time tracking of ongoing vehicle shifts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeShifts.map((shift) => (
                    <div key={shift.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{shift.route}</h4>
                          <p className="text-sm text-gray-600">{shift.vehicle}</p>
                        </div>
                        <Badge variant={shift.status === 'in_transit' ? 'default' : 'secondary'}
                          className={shift.status === 'in_transit' ? 'bg-green-100 text-green-800' : ''}>
                          {shift.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div><p className="text-xs text-gray-500">Customer</p><p className="text-sm font-medium">{shift.customer}</p></div>
                        <div><p className="text-xs text-gray-500">Traveler</p><p className="text-sm font-medium">{shift.traveler}</p></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Progress</span><span>{shift.progress}%</span></div>
                        <Progress value={shift.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>User Statistics</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><span>Active Customers</span><span className="font-bold text-blue-600">{operationalStats.activeCustomers}</span></div>
                    <div className="flex justify-between items-center"><span>Active Travelers</span><span className="font-bold text-green-600">{operationalStats.activeTravelers}</span></div>
                    <div className="flex justify-between items-center"><span>New Registrations Today</span><span className="font-bold text-purple-600">47</span></div>
                    <div className="flex justify-between items-center"><span>Verification Pending</span><span className="font-bold text-orange-600">12</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Platform Health</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div><div className="flex justify-between mb-1"><span className="text-sm">Server Uptime</span><span className="text-sm">99.8%</span></div><Progress value={99.8} className="h-2" /></div>
                    <div><div className="flex justify-between mb-1"><span className="text-sm">Success Rate</span><span className="text-sm">96.2%</span></div><Progress value={96.2} className="h-2" /></div>
                    <div><div className="flex justify-between mb-1"><span className="text-sm">Customer Satisfaction</span><span className="text-sm">94.5%</span></div><Progress value={94.5} className="h-2" /></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle>Revenue Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm">Today</span><span className="font-bold">₹{operationalStats.revenue.today.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm">This Week</span><span className="font-bold">₹{operationalStats.revenue.thisWeek.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm">This Month</span><span className="font-bold">₹{operationalStats.revenue.thisMonth.toLocaleString()}</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm">Avg. Shift Time</span><span className="font-bold">4.2h</span></div>
                    <div className="flex justify-between"><span className="text-sm">Customer Retention</span><span className="font-bold">87%</span></div>
                    <div className="flex justify-between"><span className="text-sm">Traveler Retention</span><span className="font-bold">92%</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Growth Metrics</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm">Monthly Growth</span><span className="font-bold text-green-600">+12%</span></div>
                    <div className="flex justify-between"><span className="text-sm">User Acquisition</span><span className="font-bold text-blue-600">+8%</span></div>
                    <div className="flex justify-between"><span className="text-sm">Revenue Growth</span><span className="font-bold text-purple-600">+15%</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
