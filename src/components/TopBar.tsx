import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { linkIcon } from "@/lib/link-icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAME_LINK_INTERACTION_CLASSES =
  "underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export type TopBarLink = {
  label: string;
  url: string;
};

export type TopBarStream = {
  id: string;
  label: string;
};

export type TopBarProps = {
  name: string;
  links: readonly TopBarLink[];
  streams: readonly TopBarStream[];
  activeStream?: string;
};

type StreamItem = {
  id: string;
  label: string;
  href: string;
  current: boolean;
};

function toStreamItems(
  streams: readonly TopBarStream[],
  activeStream?: string,
): StreamItem[] {
  return streams.map((stream) => ({
    id: stream.id,
    label: stream.label,
    href: `/streams/${stream.id}`,
    current: stream.id === activeStream,
  }));
}

function CareerStreamMenu({ items }: { items: readonly StreamItem[] }) {
  return (
    <NavigationMenu viewport={false} aria-label="Career stream">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resume</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-48 gap-1 p-1">
              {items.map((item) => (
                <li key={item.id}>
                  <NavigationMenuLink href={item.href} active={item.current}>
                    {item.label}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileStreamNav({ items }: { items: readonly StreamItem[] }) {
  return (
    <nav aria-label="Career stream menu">
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ProfileLink({ link }: { link: TopBarLink }) {
  const icon = linkIcon(link.url);
  const iconOnly = icon !== undefined;

  return (
    <Button asChild variant="outline" size={iconOnly ? "icon-sm" : "sm"}>
      <a
        href={link.url}
        aria-label={iconOnly ? link.label : undefined}
        title={iconOnly ? link.label : undefined}
      >
        {icon === undefined ? (
          link.label
        ) : (
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            loading="eager"
            decoding="async"
            className="size-4"
          />
        )}
      </a>
    </Button>
  );
}

function ProfileLinks({ links }: { links: readonly TopBarLink[] }) {
  return (
    <>
      {links.map((link) => (
        <ProfileLink key={link.url} link={link} />
      ))}
    </>
  );
}

export default function TopBar({
  name,
  links,
  streams,
  activeStream,
}: TopBarProps) {
  const streamItems = toStreamItems(streams, activeStream);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3">
        <h1 className="text-lg font-semibold text-foreground">
          <a href="/" className={NAME_LINK_INTERACTION_CLASSES}>
            {name}
          </a>
        </h1>
        <div className="hidden items-center gap-2 md:flex">
          <ProfileLinks links={links} />
          <CareerStreamMenu items={streamItems} />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <a
                href="/"
                className={`text-sm text-muted-foreground ${NAME_LINK_INTERACTION_CLASSES}`}
              >
                {name}
              </a>
            </SheetHeader>
            <div className="flex flex-col gap-6 px-4 pb-4">
              <section>
                <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                  Resume
                </h2>
                <MobileStreamNav items={streamItems} />
              </section>
              <section>
                <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                  Links
                </h2>
                <div className="flex flex-col gap-2">
                  <ProfileLinks links={links} />
                </div>
              </section>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
