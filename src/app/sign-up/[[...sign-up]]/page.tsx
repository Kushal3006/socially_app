import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <SignUp 
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