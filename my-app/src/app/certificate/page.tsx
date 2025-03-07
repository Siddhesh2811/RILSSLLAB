import React from 'react'
import styles from '@/app/certificate/page.module.css'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarImage } from "@/components/ui/avatar"



const page = () => {
  return (
    <div className={styles.container}>
      <div className={styles.certType}>
        <div className={styles.card}>
          <Card>
            <div className={styles.cardContent}>
              <CardHeader>
                <CardTitle>New Certificate</CardTitle>
                <CardDescription>Generate a new Internal/GoDaddy certificate</CardDescription>
              </CardHeader>
            </div>
            <CardFooter>
              <div className={styles.createButton}>
                <Button asChild>
                  <Link href="/certificate/new">Create</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className={styles.card}>
          <Card>
            <div className={styles.cardContent}>
              <CardHeader>
                <CardTitle>Renew Certificate</CardTitle>
                <CardDescription>Renew an existing Internal/GoDaddy certificate</CardDescription>
              </CardHeader>
            </div>
            <CardFooter>
              <div className={styles.createButton}>
                <Button asChild>
                  <Link href="/certificate/renew">Create</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className={styles.card}>
          <Card>
            <div className={styles.cardContent}>
              <CardHeader>
                <CardTitle>SAN Addition</CardTitle>
                <CardDescription>Add SAN in a Internal/GoDaddy certificate</CardDescription>
              </CardHeader>
            </div>
            <CardFooter>
              <div className={styles.createButton}>
                <Button asChild>
                  <Link href="/certificate/sanadd">Create</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className={styles.certTable}>
        <div className={styles.tableTitle}>
          <div className={styles.recentIcon}>
            <Avatar className='h-7 w-7'>
              <AvatarImage src="https://img.icons8.com/?size=100&id=S7rUasmlOqdO&format=png&color=000000" />
            </Avatar>
          </div>
          <div>Recent</div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">CertID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>FQDN</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">C000</TableCell>
              <TableCell>06/03/2025</TableCell>
              <TableCell>example.ril.com</TableCell>
              <TableCell className="text-right">Completed</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default page