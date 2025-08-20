import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ModalSuccess({ title = "", description = "" }) {
  return (
    <div className="grid w-full items-start gap-4">
      <Alert className={'shadow-md text-green-500'}>
        <CheckCircle2Icon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}
