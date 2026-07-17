import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogPage() {
  const products = {
    "magnetic-cable-clips": "/products/magnetic-cable-clips-6-pack",
    "cable-sleeve": "/products/braided-cable-management-sleeve",
    "mesh-organizer": "/products/mesh-desk-organizer-caddy",
    "rgb-lights": "/products/rgb-smart-led-strip-lights",
    "whiteboard-calendar": "/products/reusable-whiteboard-wall-calendar",
    "wrist-rest": "/products/ergonomic-gel-wrist-rest",
    "seat-cushion": "/products/memory-foam-coccyx-seat-cushion",
    "focus-timer": "/products/bluetooth-focus-timer-cube",
    "under-desk-drawer": "/products/under-desk-drawer-organizer",
    "bamboo-stand": "/products/bamboo-monitor-stand-with-storage",
  };

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            Workspace Tips
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            10 Desk Upgrades Under $50 That Will Transform Your WFH Setup
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>July 15, 2026</span>
            <span>·</span>
            <span>5 min read</span>
          </div>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Let's be real: most "productivity gadgets" are either overpriced or
            useless. But there are a handful of desk upgrades that actually move
            the needle — and none of them cost more than $50. We tested dozens
            of products to find the ones that remote workers genuinely love.
            Here are our top 10 picks.
          </p>
        </div>

        {/* Product 1 */}
        <Section number={1} title='Magnetic Cable Clips (6-Pack) — $9'>
          <p>
            The cheapest upgrade on this list, and arguably the most impactful.
            These neodymium magnetic clips snap onto any metal surface (or stick
            anywhere with the included adhesive plates) and hold up to 3 cables
            each.
          </p>
          <BestFor>
            Anyone who charges devices at their desk. Route your USB-C,
            Lightning, and headphone cables along your desk edge. No more "which
            cord is this?" guessing game.
          </BestFor>
          <ShopLink href={products["magnetic-cable-clips"]}>
            Shop Magnetic Cable Clips →
          </ShopLink>
        </Section>

        {/* Product 2 */}
        <Section number={2} title="Braided Cable Management Sleeve — $14">
          <p>
            If your under-desk area looks like a snake pit, this is your fix.
            The expandable braided sleeve wraps 3–8 cables into one tidy bundle.
            Cut it to any length. The velour interior protects cable sheathing
            from wear.
          </p>
          <BestFor>
            Permanent desk setups with monitors, laptop, printer, and lamp
            cables. One sleeve, five seconds, instant zen.
          </BestFor>
          <ShopLink href={products["cable-sleeve"]}>
            Shop Cable Management Sleeve →
          </ShopLink>
        </Section>

        {/* Product 3 */}
        <Section number={3} title="Mesh Desk Organizer Caddy — $17">
          <p>
            The $17 cure for "I know I had that sticky note somewhere." Five
            compartments keep pens, phone, paper clips, and to-do lists
            organized. The front slot holds a photo or reminder card.
          </p>
          <BestFor>
            Visual organizers who need quick access to daily desk essentials.
          </BestFor>
          <ShopLink href={products["mesh-organizer"]}>
            Shop Mesh Desk Organizer →
          </ShopLink>
        </Section>

        {/* Product 4 */}
        <Section number={4} title="RGB Smart LED Strip Lights — $19">
          <p>
            Yes, RGB lights aren't just for gaming setups. A warm bias light
            behind your monitor reduces eye strain, and a strip under your desk
            creates ambient lighting that makes late-night work feel less
            isolating. App-controlled, music-synced, 16 million colors.
          </p>
          <BestFor>
            Evening workers who want to reduce eye strain and set a mood without
            harsh overhead lights.
          </BestFor>
          <ShopLink href={products["rgb-lights"]}>
            Shop RGB Strip Lights →
          </ShopLink>
        </Section>

        {/* Product 5 */}
        <Section number={5} title="Reusable Whiteboard Wall Calendar — $21">
          <p>
            Digital calendars are great until you need to see the whole month at
            a glance. This 36"×24" peel-and-stick calendar goes on any smooth
            wall and removes without residue. The 12-month grid layout is a
            game-changer for visual planners.
          </p>
          <BestFor>
            Anyone juggling multiple projects, deadlines, or family schedules.
            One glance and you know your entire month.
          </BestFor>
          <ShopLink href={products["whiteboard-calendar"]}>
            Shop Whiteboard Calendar →
          </ShopLink>
        </Section>

        {/* Product 6 */}
        <Section number={6} title="Ergonomic Gel Wrist Rest — $22">
          <p>
            If you type for more than 3 hours a day, you need wrist support.
            Period. The gel-infused memory foam conforms to your wrists, reduces
            pressure points, and the non-slip rubber base keeps it planted.
            Costs less than one takeout lunch.
          </p>
          <BestFor>
            Writers, programmers, and anyone who's felt that "tingly" sensation
            in their wrists after a long typing session.
          </BestFor>
          <ShopLink href={products["wrist-rest"]}>
            Shop Ergonomic Wrist Rest →
          </ShopLink>
        </Section>

        {/* Product 7 */}
        <Section number={7} title="Memory Foam Coccyx Seat Cushion — $27">
          <p>
            Your office chair is probably terrible for your spine. This
            contoured memory foam cushion relieves tailbone pressure and
            promotes proper alignment. The breathable velvet cover is removable
            and washable. Non-slip bottom keeps it in place.
          </p>
          <BestFor>
            8-hour desk workers. Take it from office chair → dining chair → car
            seat. Your lower back will notice the difference by day 3.
          </BestFor>
          <ShopLink href={products["seat-cushion"]}>
            Shop Seat Cushion →
          </ShopLink>
        </Section>

        {/* Product 8 */}
        <Section number={8} title="Bluetooth Focus Timer Cube — $27">
          <p>
            Pomodoro technique, but make it tactile. Flip the cube to 5, 15, 25,
            or 45 minutes — it vibrates when time's up. Syncs via Bluetooth to
            track your focus stats. The genius part? No phone involved. No
            distractions.
          </p>
          <BestFor>
            ADHD warriors, deep work devotees, and anyone who picks up their
            phone "just to start a timer" and loses 30 minutes.
          </BestFor>
          <ShopLink href={products["focus-timer"]}>
            Shop Focus Timer Cube →
          </ShopLink>
        </Section>

        {/* Product 9 */}
        <Section number={9} title="Under Desk Drawer Organizer — $29">
          <p>
            Take the clutter off your desk and put it <em>under</em> your desk.
            This bamboo/ABS drawer mounts in seconds (no tools), holds pens,
            sticky notes, earbuds, and charging cables, and slides out smoothly.
            Guests will never know it's there.
          </p>
          <BestFor>
            Minimalists who want a clean desk surface but still need quick
            access to small items. Perfect for standing desks.
          </BestFor>
          <ShopLink href={products["under-desk-drawer"]}>
            Shop Under Desk Drawer →
          </ShopLink>
        </Section>

        {/* Product 10 */}
        <Section number={10} title="Bamboo Monitor Stand with Storage — $35">
          <p>
            Raise your screen to eye level — and gain a storage drawer. This
            bamboo stand lifts your monitor 4.7" for proper ergonomic posture,
            has a built-in drawer for pens and sticky notes, and a cable
            pass-through to keep things tidy. Supports up to 50 lbs.
          </p>
          <BestFor>
            Dual-monitor users and anyone working on a laptop that needs to be
            propped up. The drawer is a game-changer for small desks.
          </BestFor>
          <ShopLink href={products["bamboo-stand"]}>
            Shop Bamboo Monitor Stand →
          </ShopLink>
        </Section>

        {/* Verdict */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
          <h2 className="text-2xl font-bold text-gray-900">The Verdict</h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            You don't need to spend hundreds to upgrade your workspace. Start
            with the{" "}
            <strong>Braided Cable Management Sleeve ($14)</strong> — it's the
            highest-impact-per-dollar upgrade on this list. Then add the{" "}
            <strong>Ergonomic Gel Wrist Rest ($22)</strong> and{" "}
            <strong>Monitor Light Bar ($39)</strong> for a complete desk
            transformation under $80.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
          >
            Shop All Products
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </article>
    </main>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 border-b border-gray-100 pb-8 last:border-0">
      <h2 className="inline-flex items-center gap-3 text-xl font-bold text-gray-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-3 pl-11">{children}</div>
    </section>
  );
}

function BestFor({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm italic text-gray-500">
      <span className="font-semibold not-italic text-gray-700">
        Best for:
      </span>{" "}
      {children}
    </p>
  );
}

function ShopLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={href}
      className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
    >
      {children}
    </Link>
  );
}
