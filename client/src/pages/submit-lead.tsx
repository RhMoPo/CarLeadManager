import { useAuth } from "@/hooks/use-auth";
import { LeadForm } from "@/components/leads/lead-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function SubmitLeadPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  if (submitted) {
    return (
      <div className="flex-1 p-6" data-testid="submit-success-page">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Lead Submitted Successfully!</h2>
            <p className="text-slate-600 mb-6">
              Your lead has been submitted and is pending review. You'll be notified once it's approved.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSubmitted(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                data-testid="button-submit-another"
              >
                Submit Another Lead
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6" data-testid="submit-lead-page">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Submit New Lead</h1>
          <p className="text-slate-600 mt-2">
            Fill out the form below to submit a new car lead for review
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
            <CardDescription>
              Please provide as much detail as possible about the vehicle and seller
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeadForm 
              onSuccess={() => setSubmitted(true)} 
              submitButtonText="Submit Lead"
            />
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Ensure all vehicle information is accurate and complete</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Include valid seller contact information for follow-up</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Provide realistic pricing estimates based on market research</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Double-check the source URL is accessible and active</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
