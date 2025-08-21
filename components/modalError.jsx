import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ModalError({ title, description }) {
  return (
    <div className="grid min-w-full max-w-full items-start gap-4">
      <Alert variant="destructive" className={"shadow-md"}>
        <AlertCircleIcon />
        <AlertTitle>
          {typeof title === "object" ? JSON.stringify(title) : title}
        </AlertTitle>
        <AlertDescription>
          <p>{description}</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
