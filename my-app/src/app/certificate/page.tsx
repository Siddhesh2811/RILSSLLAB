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


const page = () => {
  return (
    <div className={styles.container}>
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
      {/* <div className={styles.card}>
        <Card>
          <CardHeader>
            <CardTitle>Renew Certificate</CardTitle>
            <CardDescription>Renew an existing Internal/GoDaddy certificate</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className={styles.card}>
        <Card>
          <CardHeader>
            <CardTitle>SAN Addition</CardTitle>
            <CardDescription>Additon of any SAN in existing Internal/GoDaddy certificate</CardDescription>
          </CardHeader>
        </Card>
      </div> */}
    </div>
  )
}

export default page