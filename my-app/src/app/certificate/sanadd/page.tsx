"use client";

import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";

import styles from "@/app/certificate/new/page.module.css";

const formSchema = z.object({
  fqdn: z.string().min(2, "FQDN is required"),
});

type FormValues = z.infer<typeof formSchema>;

function SanTagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (
        trimmed &&
        !value.includes(trimmed) &&
        /^[a-zA-Z0-9.-]+$/.test(trimmed)
      ) {
        onChange([...value, trimmed]);
        setInputValue("");
      }
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <FormItem>
      <FormLabel>Additional SANs</FormLabel>
      <FormControl>
        <div
          className="flex flex-wrap gap-2 p-2 border rounded-md bg-white"
          style={{ minHeight: 42, alignItems: "center" }}
        >
          {value.map((tag, i) => (
            <div
              key={i}
              className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="ml-1 font-bold text-blue-600 hover:text-blue-900"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setInputValue(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type domain and press Enter or comma"
            className="flex-grow outline-none border-none p-1 text-sm min-w-[150px]"
          />
        </div>
      </FormControl>
    </FormItem>
  );
}

export default function UpdateCSRForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fqdn: "",
    },
  });

  const [sanTags, setSanTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const payload = {
        fqdn: values.fqdn,
        san: sanTags,
      };

      const response = await fetch("/api/update-csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const result = await response.json();

      toast.success("CSR updated successfully!", {
        description: "Click below to download the updated ZIP.",
        action: {
          label: "Download",
          onClick: () => {
            const a = document.createElement("a");
            a.href = result.zip;
            a.download = `${values.fqdn}-updated.zip`;
            a.click();
          },
        },
      });
    } catch (error) {
      console.error("CSR Update Error:", error);
      toast.error("Failed to update CSR. Check FQDN folder and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.card}>
          <Card>
            <CardTitle className={styles.formTitle}>Update CSR with New SANs</CardTitle>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 max-w-3xl mx-auto py-10"
              >
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="fqdn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FQDN</FormLabel>
                          <FormControl>
                            <Input placeholder="example.com" type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <SanTagsInput value={sanTags} onChange={setSanTags} />

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
                      Updating...
                    </>
                  ) : (
                    "Update CSR"
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
