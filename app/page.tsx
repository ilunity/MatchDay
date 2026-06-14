import Link from "next/link";
import { auth } from "@/lib/auth";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="container px-4 py-12 sm:py-20">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {ru.heroTitle}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{ru.heroSubtitle}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {session ? (
            <>
              <Link href="/events/new">
                <Button size="lg">{ru.createEvent}</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  {ru.dashboard}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login?callbackUrl=/events/new">
                <Button size="lg">{ru.getStarted}</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  {ru.login}
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ru.features.create}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{ru.features.createDesc}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ru.features.share}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{ru.features.shareDesc}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ru.features.results}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{ru.features.resultsDesc}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
