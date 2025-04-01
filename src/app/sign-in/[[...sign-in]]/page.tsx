import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-md rounded-lg border border-gray-200 dark:border-gray-800",
          }
        }}
      />
    </div>
  );
} 