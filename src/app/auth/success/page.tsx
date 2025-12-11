export default function SuccessPage() {
  return (
    <section className="w-full">
      <div className="flex flex-col justify-center items-center text-center w-full mb-10">
        <span className="w-12 bg-green-100 h-12 rounded-full flex justify-center items-center">
          🎉
        </span>
        <h1 className="text-center text-primary text-xl font-semibold mb-1 mt-4">
          Account created successfully
        </h1>
        <p className="text-muted-foreground text-sm">
          To finish setting up your account, please verify your email address.
          We sent a link to your email. If you don&apos;t see it, check your
          spam
        </p>
      </div>
    </section>
  );
}
