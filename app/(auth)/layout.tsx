import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.42),_transparent_26%),linear-gradient(180deg,_#fcfaff_0%,_#f3ebff_55%,_#ede9fe_100%)] px-4 pt-24 pb-12">
      <div className="mx-auto flex max-w-6xl justify-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
