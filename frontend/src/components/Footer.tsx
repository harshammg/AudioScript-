import { Heart } from "lucide-react";

const Footer = () => {
    return (
        <footer className="w-full py-6 mt-12 border-t border-border/40 bg-background/50 backdrop-blur-sm">
            <div className="container max-w-3xl mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-muted-foreground text-center md:text-left">
                    &copy; {new Date().getFullYear()} AudioScript. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                        Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> by You
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
