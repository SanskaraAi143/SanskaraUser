import { useState } from "react";
import { supabase } from "@/services/supabase/config";
import { toast } from "@/components/ui/use-toast";

export default function ChangePasswordSection() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({
          variant: "destructive",
          title: "Change Failed",
          description: error.message || "Could not update password.",
        });
      } else {
        toast({
          title: "Password Changed",
          description: "Your password has been updated.",
        });
        setNewPassword("");
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Change Failed",
        description: e?.message || "Could not update password.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        disabled={loading}
        className="border rounded px-2 py-1"
      />
      <button
        onClick={handleChangePassword}
        disabled={loading || !newPassword}
        className="bg-wedding-red hover:bg-wedding-deepred text-white px-3 py-1 rounded"
      >
        {loading ? "Changing..." : "Change Password"}
      </button>
    </div>
  );
}
