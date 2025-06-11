"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardTitle } from "@/components/ui/card"

import styles from "@/app/certificate/renew/page.module.css"

const formSchema = z.object({
  fqdn: z.string().min(2, "FQDN is required"),
})

type FormValues = z.infer<typeof formSchema>

export default function RenewCertificateForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fqdn: "",
    },
  })

  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fqdn: values.fqdn }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Something went wrong")
      }

      const result = await response.json()

      toast.success("CSR ready to download!", {
        description: "Click below to download the ZIP file.",
        action: {
          label: "Download",
          onClick: () => {
            const a = document.createElement("a")
            a.href = result.url
            a.download = `${values.fqdn}.zip`
            a.click()
          },
        },
      })
    } catch (error) {
      console.error("Renewal error:", error)
      toast.error("Failed to renew certificate. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.card}>
          <Card>
            <CardTitle className={styles.formTitle}>Renew Certificate</CardTitle>

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
                      Processing...
                    </>
                  ) : (
                    "Renew"
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
