
export function Footer() {
    return (
        <footer className="border-t border-border/60 text-muted-foreground">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
                <p>&copy; {new Date().getFullYear()} BookHaven. All rights reserved.</p>
            </div>
        </footer>
    );
}
