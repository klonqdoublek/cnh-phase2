import { useState } from 'react'
import { Avatar } from '@/bbl/avatar'
import { Icon } from '@/bbl/icon'
import { ListContent } from '@/bbl/building-block-list-content'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { ProductShell, type ProductNavGroup } from '@/patterns/product-shell'
import { ProfileMenu } from '@/patterns/profile-menu'
import { go } from '@/lib/hash'

export const NAV: ProductNavGroup[] = [
  {
    label: 'Customer Notification Hub',
    items: [
      { id: 'template-management', label: 'Notification management' },
      { id: 'broadcast', label: 'Broadcast message' },
    ],
  },
]

export const USER = { initials: 'PR', shortName: 'Panisa R.', name: 'Panisa Rungsawat', role: 'Analyst' }

/**
 * Layer 1 + 2: webds `product-shell` (measured on CNH itself), with the
 * profile row in its footer and webds `profile-menu` as its overlay. Screens
 * author Layer 3 only.
 */
export function AppShell({ activeId, children }: { activeId: string; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <>
      <ProductShell
        logo={<img src="/bbl-logo.svg" alt="Bangkok Bank" width={161} height={40} />}
        nav={NAV}
        activeId={activeId}
        onSelect={(id) => go(id === 'broadcast' ? '/broadcast' : '/list')}
        footer={<ProfileRow expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} />}
        overlay={
          menuOpen ? (
            <ProfileMenu
              initials={USER.initials}
              name={USER.name}
              role={USER.role}
              onDismiss={() => setMenuOpen(false)}
              /* The pattern leaves position to the consumer. The original build
                 anchors the card to the sidebar at x53, bottom 52 (QA U27). */
              className="absolute bottom-[52px] left-[53px] z-50"
              actions={[
                {
                  label: 'Logout',
                  icon: <Icon slug="logout" size={16} />,
                  onClick: () => {
                    setMenuOpen(false)
                    setLogoutOpen(true)
                  },
                },
              ]}
            />
          ) : undefined
        }
      >
        {children}
      </ProductShell>

      {logoutOpen && (
        <ConfirmDialog
          anatomy="sectioned"
          destructive
          contentType="label-xl"
          layer="fixed"
          width={600}
          title="You are about to log out"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          onCancel={() => setLogoutOpen(false)}
          onDismiss={() => setLogoutOpen(false)}
          onConfirm={() => {
            setLogoutOpen(false)
            go('/login')
          }}
          className="z-50"
        >
          Are you sure you want to log out?
        </ConfirmDialog>
      )}
    </>
  )
}

/** The sidebar's foot row: avatar 32, short name over role. */
function ProfileRow({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={expanded}
      onClick={onClick}
      className="flex h-full w-full cursor-pointer items-center px-[var(--space-4)] py-[var(--space-2)] text-left hover:bg-[var(--color-surface-primary-hovered)] aria-expanded:bg-[var(--color-surface-primary-hovered)]"
    >
      <ListContent type="custom" size="m" className="w-full">
        <Avatar type="letter" initials={USER.initials} size={32} />
        <span className="flex min-w-px flex-1 flex-col">
          <span className="truncate type-label-xl text-[var(--color-text-primary-default)]">{USER.shortName}</span>
          <span className="truncate type-body-s text-[var(--color-text-secondary-default)]">{USER.role}</span>
        </span>
      </ListContent>
    </button>
  )
}
