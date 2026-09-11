import ImageUpload from "./components/ImageUpload";
export default function Home() {
  return (
    <div className="border border-green-500 flex flex-col flex-1  bg-zinc-50 font-sans dark:bg-zinc-800">
      <main className="border border-blue-500 p-10">
        <h1 className="text-4xl font-bold">Fawna Learning</h1>

        <section className="flex items-center justify-center border border-red-500">
          <ImageUpload />
        </section>
      </main>
    </div>
  );
}
