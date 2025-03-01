import React from 'react'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link'
import styles from '@/components/customui/appBar/appBar.module.css'
import { Separator } from '@/components/ui/separator'

const appBar = () => {
    return (<div>
        <div className={styles.container}>
            <div className={styles.title}>
                RILSSLLabs
            </div>
            <div className={styles.appBar}>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <Link href="/dashboard">
                                <NavigationMenuLink >
                                    Dashboard
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href='/certificate'>
                                <NavigationMenuLink>Certificate</NavigationMenuLink></Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href='/reports'>
                                <NavigationMenuLink>Reports</NavigationMenuLink></Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <div className={styles.userIcon}>
                                <Link href='/user'>
                                    <Avatar className='w-5 h-5'>
                                        <AvatarImage src="https://img.icons8.com/?size=100&id=84020&format=png&color=000000" />
                                    </Avatar></Link></div>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

        </div>
        <Separator />
    </div>
    )
}

export default appBar