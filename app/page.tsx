"use client";

import UploadImage from "@/components/file-upload";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto mt-4">
      <UploadImage
        onChange={(key) => console.log(key)}
        accept={{
          "image/*": [".png", ".gif", ".jpeg", ".jpg"],
        }}
      />
    </div>
  );
}
