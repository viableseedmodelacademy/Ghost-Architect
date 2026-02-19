import Sidebar from "../components/Sidebar";
import FileUploader from "../components/FileUploader";
import ChatWindow from "../components/ChatWindow";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-navy text-gold">
      <Sidebar />
      <main className="flex-1 p-8 flex flex-col">
        <h1 className="text-4xl font-bold mb-8">Welcome to THE LEGAL ORACLE</h1>
        <p className="text-lg mb-8">Your private data brain for legal research.</p>
        <section className="mb-10 flex-1">
          <h2 className="text-3xl font-semibold mb-5">Private Vault</h2>
          <FileUploader />
        </section>
        <section className="flex-1">
          <ChatWindow />
        </section>
      </main>
    </div>
  );
}