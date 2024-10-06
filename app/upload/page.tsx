import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 grow w-full">
      <div className="flex flex-row">
        <div className="text-center flex flex-col m-auto grow">
          <FileSpreadsheet aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
          <div className="mt-4 flex text-sm leading-6">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:underline"
            >
              <span>Upload</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" />
            </label>
            <p className="pl-1">or drag and drop a file</p>
          </div>
          <p className="text-xs leading-5">CSV files up to 50 MB</p>
        </div>
      </div>
    </div>
  );
}
