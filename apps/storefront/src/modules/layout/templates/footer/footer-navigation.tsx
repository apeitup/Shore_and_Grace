"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { NavArrowDown } from "iconoir-react"
import { useState } from "react"

import { footerGroups } from "./footer-links"
import styles from "./footer.module.css"

export default function FooterNavigation() {
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  return (
    <nav className={styles.mobileNavigation} aria-label="Footer navigation">
      {footerGroups.map((group) => {
        const panelId = `footer-${group.title.toLowerCase().replaceAll(" ", "-")}`
        const isOpen = openGroup === group.title

        return (
          <section className={styles.mobileGroup} key={group.title}>
            <button
              type="button"
              className={styles.mobileGroupButton}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenGroup(isOpen ? null : group.title)}
            >
              <span>{group.title}</span>
              <NavArrowDown
                className={styles.mobileGroupIcon}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <ul id={panelId} className={styles.mobileGroupLinks}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink href={link.href}>
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </nav>
  )
}
