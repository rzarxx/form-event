import LoginForm from "./login-form";

export const metadata = {
  title: "Login - CampusTicketing",
  description: "Masuk ke panel CampusTicketing",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle gradient border effect on top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400 mb-2 font-poppins">
              CampusTicketing
            </h1>
            <p className="text-slate-400 text-sm">
              Masuk ke akun Panitia, Admin, atau Scanner Anda.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
