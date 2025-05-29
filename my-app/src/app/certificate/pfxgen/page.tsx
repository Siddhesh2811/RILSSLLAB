"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";

import styles from "@/app/certificate/pfxgen/page.module.css";
import { getRandomValues } from "crypto";

const formSchema = z.object({
  fqdn: z.string().min(1, "FQDN is required"),
  passphrase: z.string().min(1, "Passphrase is required"),
  crtfile: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Please upload exactly one .crt file"),
});

export default function MyForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("fqdn", data.fqdn);
      formData.append("passphrase", data.passphrase);
      formData.append("crtfile", data.crtfile[0]); // single file

      const res = await fetch("/api/pfx-generator", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log(result);

      if (res.ok && result.success) {

        toast.success("PFX generated successfully!", {
          description: "Click below to download the PFX file.",
          action: {
            label: "Download PFX",
            onClick: () => {
              const a = document.createElement("a");
              a.href = result.downloadUrl;  // your original download URL
              a.target = "_blank";
              a.rel = "noopener noreferrer";
              a.download = `${data.fqdn}.pfx`; // adjust filename as needed
              a.click();
            },
          },
        });


      } else {
        toast.error(result.error || "Failed to generate PFX");
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.card}>
          <Card>
            <CardTitle className={styles.formTitle}>PFX Generator</CardTitle>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 max-w-3xl mx-auto py-10"
                encType="multipart/form-data"
              >
                <FormField
                  control={form.control}
                  name="fqdn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FQDN</FormLabel>
                      <FormControl>
                        <Input placeholder="example.ril.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passphrase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passphrase</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="crtfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload your .crt file</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".crt"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormDescription>Upload your .crt file</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
