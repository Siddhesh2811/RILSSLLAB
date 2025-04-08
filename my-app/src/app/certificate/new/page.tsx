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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import styles from "@/app/certificate/new/page.module.css"

const formSchema = z.object({
  appName: z.string().min(1).min(2).max(50),
  fqdn: z.string().min(1).min(2).max(50),
  appOwner: z.string().min(1).min(2).max(50),
  appSpoc: z.string().min(1).min(2).max(50),
  san: z.string().min(1).min(2).optional(),
  type: z.string()
});

export default function MyForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

  })

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true); // start loader
  
    try {
      const response = await fetch("/api/generate-csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fqdn: values.fqdn }),
      });
  
      console.log("Response:", response);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }
  
      const result = await response.json();
      console.log("API Result:", result);
  
      // 🎉 Show download toast
      toast.success("CSR and Key generated successfully!", {
        description: "Click below to download the ZIP file.",
        action: {
          label: "Download",
          onClick: () => {
            const a = document.createElement("a");
            a.href = result.zip;
            a.download = `${values.fqdn}.zip`;
            a.click();
          },
        },
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to generate CSR. Please try again.");
    } finally {
      setIsLoading(false); // stop loader
    }
  }
  
  
  

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.card}><Card>
          <CardTitle className={styles.formTitle}>
            New Certificate
          </CardTitle>
          
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-3xl mx-auto py-10">

        <div className="grid grid-cols-12 gap-4">

          <div className="col-span-6">

            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""

                      type="text"
                      {...field} />
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
                    <Input
                      placeholder="example.com"

                      type="text"
                      {...field} />
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
                    <Input
                      placeholder=""

                      type="text"
                      {...field} />
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
                    <Input
                      placeholder=""

                      type="text"
                      {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <FormField
          control={form.control}
          name="san"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional SANs</FormLabel>
              <FormControl>
                <Input
                  placeholder=""

                  type="text"
                  {...field} />
              </FormControl>
              <FormDescription>Enter the FQDNs seperated by "," .</FormDescription>
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
    </Form></Card></div></div></div>
  )
}