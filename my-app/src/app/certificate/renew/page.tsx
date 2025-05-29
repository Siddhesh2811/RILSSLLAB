"use client"
import {
  useState
} from "react"
import {
  toast
} from "sonner"
import {
  useForm
} from "react-hook-form"
import {
  zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  cn
} from "@/lib/utils"
import {
  Button
} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Input
} from "@/components/ui/input"
import {
  Card,
  CardTitle,
} from "@/components/ui/card"

import styles from "@/app/certificate/renew/page.module.css"


const formSchema = z.object({
  fqdn: z.string().min(1)
});

export default function MyForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.card}>
          <Card>
            <CardTitle className={styles.formTitle}>Renew Certificate</CardTitle>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-3xl mx-auto py-10">
 <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                <FormField
                  control={form.control}
                  name="fqdn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FQDN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder=""

                          type=""
                          {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
                </div>
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  )
}