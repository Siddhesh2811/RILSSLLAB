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
  CloudUpload,
  Paperclip
} from "lucide-react"
import { Label } from "@/components/ui/label"

import styles from "@/app/certificate/pfxgen/page.module.css"

const formSchema = z.object({
  name_9140475896: z.string().min(1),
  name_6765001998: z.string().min(1),
  crtfile: z.string()
});

export default function MyForm() {

  const [files, setFiles] = useState < File[] | null > (null);

  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };
  const form = useForm < z.infer < typeof formSchema >> ({
    resolver: zodResolver(formSchema),

  })

  function onSubmit(values: z.infer < typeof formSchema > ) {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
        
        <div className="grid grid-cols-12 gap-4">
          
          <div className="col-span-4">
            
        <FormField
          control={form.control}
          name="name_9140475896"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FQDN</FormLabel>
              <FormControl>
                <Input 
                placeholder="example.ril.com"
                
                type=""
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
          name="name_6765001998"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passphrase</FormLabel>
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
        
            <FormField
              control={form.control}
              name="crtfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload your .crt file</FormLabel>
                    <Input className={styles.clickInput} id="crt" type="file" />
                  <FormDescription>Select a file to upload.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}