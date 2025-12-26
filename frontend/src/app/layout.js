import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "./globals.css";
import CurrentUserProvider from "@/context/current-user-context";
import SocketProvider from "@/context/socket-context";

export const metadata = {
    title: "Путевые шахматы (WayChess)",
    description: "Играйте в шахматы против компьютера или игроков в локальной сети",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        <SocketProvider>
            <CurrentUserProvider>
                <div id="root">
                    {children}
                </div>
            </CurrentUserProvider>
        </SocketProvider>
        </body>
        </html>
    );
}
