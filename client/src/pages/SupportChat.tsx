import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, Send, ShieldCheck, MessageCircle, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LOCATIONS, USER_PROFILE } from "@/lib/constants";
import { insertEnquirySchema, type Enquiry, type EnquiryMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BrandName from "@/components/branding/BrandName";
import { formatDistanceToNow } from "date-fns";

const VEHICLE_TYPES = ["Bike", "Car", "SUV", "Premium"];
const STORAGE_KEY = "shiftzy_my_enquiries";

const formSchema = insertEnquirySchema;
type FormValues = z.infer<typeof formSchema>;

function getMyEnquiryIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function addMyEnquiryId(id: number) {
  const ids = getMyEnquiryIds();
  if (!ids.includes(id)) localStorage.setItem(STORAGE_KEY, JSON.stringify([id, ...ids]));
}

export default function SupportChat() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reply, setReply] = useState("");
  const myIds = getMyEnquiryIds();

  // Open the most recent enquiry by default, otherwise show the form
  useEffect(() => {
    if (myIds.length > 0) setActiveId(myIds[0]);
    else setShowForm(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: USER_PROFILE.name || "",
      phone: USER_PROFILE.phone || "",
      pickup: "",
      drop: "",
      vehicleType: "",
      preferredDate: "",
      message: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/enquiries", values);
      return (await res.json()) as Enquiry;
    },
    onSuccess: (enquiry) => {
      addMyEnquiryId(enquiry.id);
      setActiveId(enquiry.id);
      setShowForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries"] });
      toast({ title: "Enquiry sent to Shiftzy", description: "Our MD's desk has received it. You'll get a reply right here." });
    },
    onError: () => {
      toast({ title: "Could not send enquiry", description: "Please check the details and try again.", variant: "destructive" });
    },
  });

  const { data: thread, isLoading: threadLoading } = useQuery<{ enquiry: Enquiry; messages: EnquiryMessage[] }>({
    queryKey: ["/api/enquiries", activeId, "messages"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/enquiries/${activeId}/messages`);
      return await res.json();
    },
    enabled: activeId !== null,
    refetchInterval: 5000,
  });

  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", `/api/enquiries/${activeId}/messages`, { sender: "customer", message });
      return await res.json();
    },
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries", activeId, "messages"] });
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  return (
    <div className="max-w-md mx-auto bg-neutral-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 pt-12 pb-5 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Chat with <BrandName onDark /></h1>
            <p className="text-blue-100 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct line to our MD's desk
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setActiveId(null); }}
              className="flex items-center gap-1 bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          )}
        </div>
      </div>

      {/* New enquiry form */}
      {showForm ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-800">
              Tell us what you need — even if it's a special route or a custom drop. The MD personally arranges these.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Your name</FormLabel>
                    <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Phone / WhatsApp</FormLabel>
                    <FormControl><Input placeholder="+91 ..." {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="pickup" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Pickup</FormLabel>
                    <FormControl>
                      <Input list="support-locations" placeholder="Type any address / area" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="drop" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Drop</FormLabel>
                    <FormControl>
                      <Input list="support-locations" placeholder="Type any address / area" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <datalist id="support-locations">
                  {LOCATIONS.map((l: string) => <option key={l} value={l} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="vehicleType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Vehicle type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {VEHICLE_TYPES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="preferredDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Preferred date & time</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Your question / message</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="e.g. Is a sedan available this Saturday? Can you arrange a drop at my home?"
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {createMutation.isPending ? "Sending..." : "Send to Shiftzy"}
              </Button>

              {myIds.length > 0 && (
                <button type="button" onClick={() => { setShowForm(false); setActiveId(myIds[0]); }}
                  className="w-full text-center text-sm text-blue-600 font-medium pt-1">
                  ← Back to my conversation
                </button>
              )}
            </form>
          </Form>
        </div>
      ) : (
        /* Chat thread */
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {threadLoading ? (
              <p className="text-center text-sm text-neutral-400 mt-8">Loading conversation…</p>
            ) : thread ? (
              <>
                {/* Enquiry summary chip */}
                <div className="bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-600">
                  <p className="font-bold text-neutral-800 mb-1">
                    {thread.enquiry.pickup} → {thread.enquiry.drop} · {thread.enquiry.vehicleType}
                  </p>
                  {thread.enquiry.preferredDate && <p>Preferred: {thread.enquiry.preferredDate}</p>}
                  <p className="mt-1">
                    Status: <span className="font-semibold text-blue-700 capitalize">{(thread.enquiry.status || "new").replace("_", " ")}</span>
                  </p>
                </div>

                {thread.messages.map((m) => {
                  const isCustomer = m.sender === "customer";
                  return (
                    <div key={m.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isCustomer ? "bg-blue-600 text-white" : "bg-white border border-neutral-200 text-neutral-800"}`}>
                        {!isCustomer && <p className="text-[10px] font-bold mb-0.5"><BrandName /> · MD Desk</p>}
                        <p className="text-sm">{m.message}</p>
                        <p className={`text-[10px] mt-1 ${isCustomer ? "text-blue-100" : "text-neutral-400"}`}>
                          {(() => { try { return formatDistanceToNow(new Date(m.createdAt as any), { addSuffix: true }); } catch { return ""; } })()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : null}
          </div>

          {/* Reply box */}
          <div className="border-t border-neutral-200 bg-white p-2 shrink-0">
            <div className="flex gap-2">
              <Input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your message…"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && reply.trim()) {
                    e.preventDefault();
                    replyMutation.mutate(reply);
                  }
                }}
              />
              <Button size="icon" disabled={!reply.trim() || replyMutation.isPending} onClick={() => replyMutation.mutate(reply)}>
                <Send size={18} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
