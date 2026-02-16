import { UserMain } from "../../components/security/users";
import { FullScreenLayout } from "../../layout/FullScreenLayout";

export default function UsersPage() {
  return (
<FullScreenLayout className="relative bg-white rounded-xl shadow-sm">

<div className="container mx-auto px-4 py-6">
      <UserMain />
    </div>
  
  </FullScreenLayout>
    
);
}
