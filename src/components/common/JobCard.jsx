import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  MessageSquare, 
  ArrowRight,
  UserCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const isLabourer = user?.type === "labourer";

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200 border-border overflow-hidden">
      <CardHeader className="pb-3 border-b border-border bg-secondary/10">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="bg-white">
            {job.category || "General"}
          </Badge>
          <Badge 
            variant="secondary" 
            className={cn(
              "capitalize",
              job.status?.toLowerCase() === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700"
            )}
          >
            {job.status || "Active"}
          </Badge>
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-bold font-serif leading-tight text-foreground line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <UserCircle className="w-4 h-4" />
            <span>Posted by <span className="font-semibold text-foreground/80">{job.hirerName || "Anonymous Hirer"}</span></span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
          {job.description || "No description provided."}
        </p>
        
        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{job.location || "Location not specified"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{job.date || "Date unspecified"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary mt-3 pt-3 border-t border-border">
            <Wallet className="w-4 h-4" />
            <span>
              GH₵ {job.budget && !isNaN(Number(job.budget)) ? Number(job.budget).toLocaleString() : (job.budget || "Negotiable")}
            </span>
            <span className="text-xs text-muted-foreground ml-auto uppercase tracking-wider font-semibold">Est. Budget</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-4 flex gap-2 w-full mt-auto">
        {isLabourer && (
          <Button 
            variant="outline" 
            className="flex-1 bg-white hover:bg-secondary/20"
            onClick={() => {
              if (!job.hirerId) {
                alert("Messaging unavailable: Hirer information not found for this job.");
                return;
              }
              navigate("/dashboard/labourer/messages", {
                state: {
                  chatWith: {
                    name: job.hirerName || 'Anonymous Hirer',
                    id: job.hirerId
                  }
                }
              });
            }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
        )}
        <Button 
          className={cn(isLabourer ? "flex-1" : "w-full")}
          onClick={() => navigate(`/job/${job.id}`)}
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
