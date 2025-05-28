"use client"

import React, { useState, KeyboardEvent, ChangeEvent, useEffect } from "react"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardTitle,
} from "@/components/ui/card"

import styles from "@/app/certificate/new/page.module.css"

const formSchema = z.object({
  appName: z.string().min(2).max(50),
  fqdn: z.string().min(2).max(50),
  appOwner: z.string().min(2).max(50),
  appSpoc: z.string().min(2).max(50),
  type: z.string(),
})

type FormValues = z.infer<typeof formSchema>

function SanTagsInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [inputValue, setInputValue] = useState("")

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (
        trimmed &&
        !value.includes(trimmed) &&
        /^[a-zA-Z0-9.-]+$/.test(trimmed)
      ) {
        onChange([...value, trimmed])
        setInputValue("")
      }
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index))
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
      <FormDescription>
        Enter multiple SANs separated by comma or press Enter to add each.
      </FormDescription>
    </FormItem>
  )
}

export default function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "GoDaddy",
    },
  })

  const [sanTags, setSanTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Watch certificate type
  const certType = form.watch("type")

  // Clear SANs if certType changes to non-GoDaddy
  useEffect(() => {
    if (certType !== "GoDaddy") {
      setSanTags([])
    }
  }, [certType])

  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    try {
      const payload = {
        ...values,
        san: certType === "GoDaddy" ? sanTags : [], // only send SAN if GoDaddy
      }

      const response = await fetch("/api/generate-csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Something went wrong")
      }

      const result = await response.json()

      toast.success("CSR and Key generated successfully!", {
        description: "Click below to download the ZIP file.",
        action: {
          label: "Download",
          onClick: () => {
            const a = document.createElement("a")
            a.href = result.zip
            a.download = `${values.fqdn}.zip`
            a.click()
          },
        },
      })
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Failed to generate CSR. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.card}>
          <Card>
            <CardTitle className={styles.formTitle}>New Certificate</CardTitle>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 max-w-3xl mx-auto py-10"
              >
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="appName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Name</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="appOwner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Owner</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="appSpoc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application SPOC</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="GoDaddy or Internal(RILSUBCA or ENTWEBCA)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GoDaddy">GoDaddy</SelectItem>
                          <SelectItem value="Internal">Internal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Show SAN input only if type === "GoDaddy" */}
                {certType === "GoDaddy" && (
                  <SanTagsInput value={sanTags} onChange={setSanTags} />
                )}

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
  )
}
