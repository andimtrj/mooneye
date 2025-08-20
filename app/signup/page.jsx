import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignUp() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className={'text-xl'}>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-3">
            <Input id="name" type="text" placeholder="Name" required />
            <Input id="email" type="email" placeholder="Email" required />
            <Input id="password" type="password" placeholder='Password' required />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
}
