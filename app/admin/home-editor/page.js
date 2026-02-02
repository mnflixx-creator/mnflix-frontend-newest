"use client";

import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function HomeEditor() {
  const [movies, setMovies] = useState([]);
  const [config, setConfig] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const m = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/movies`
      ).then(r => r.json());

      const c = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/homepageSettings`
      ).then(r => r.json());

      setMovies(m);
      setConfig(c);
    }
    load();
  }, []);

  if (!config) return <div className="text-white p-6">Loading...</div>;

  const getImgSrc = (thumb) => {
    if (!thumb) return "";
    return thumb.startsWith("http")
      ? thumb
      : `${process.env.NEXT_PUBLIC_API_URL}${thumb}`;
  };

  const filtered = movies.filter((x) =>
    x.title.toLowerCase().includes(search.toLowerCase())
  );

  const add = (section, movie) => {
    if (config[section].find(m => m._id === movie._id)) return;
    setConfig({ ...config, [section]: [...config[section], movie] });
  };

  const remove = (section, id) => {
    setConfig({
      ...config,
      [section]: config[section].filter(m => m._id !== id),
    });
  };

  const move = (section, from, to) => {
    const arr = [...config[section]];
    const item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
    setConfig({ ...config, [section]: arr });
  };

  function Item({ movie, index, section }) {
    const [, drag] = useDrag({ type: "m", item: { index } });
    const [, drop] = useDrop({
      accept: "m",
      hover(item) {
        if (item.index !== index) {
          move(section, item.index, index);
          item.index = index;
        }
      },
    });

    return (
      <div
        ref={(el) => drag(drop(el))}
        className="flex items-center bg-gray-800 p-2 rounded mb-2"
      >
        <img
          src={getImgSrc(movie.thumbnail)}
          className="w-10 h-14 rounded"
        />
        <p className="ml-3 flex-1">{movie.title}</p>
        <button
          onClick={() => remove(section, movie._id)}
          className="text-red-400"
        >
          ✕
        </button>
      </div>
    );
  }

  const save = async () => {
    const payload = { ...config };

    const keys = ["featured", "newReleases", "trending", "movies", "series", "anime"];
    keys.forEach((k) => {
      payload[k] = (config[k] || []).map((m) => m._id || m);
    });

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homepageSettings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("adminToken"), // ✅ if your backend requires admin
      },
      body: JSON.stringify(payload),
    });

    alert("Saved!");
  };

  const sections = [
    ["featured", "Featured Slider"],
    ["newReleases", "New Releases"],
    ["trending", "Trending"],
    ["movies", "Movies"],
    ["series", "Series"],
    ["anime", "Anime"],
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="text-white p-6">
        <h1 className="text-3xl font-bold mb-4">Home Page Editor</h1>

        <input
          className="w-full p-2 rounded bg-gray-900 border border-gray-700 mb-5"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <div className="bg-gray-900 p-3 rounded mb-6 max-h-60 overflow-y-auto">
            {filtered.map((movie) => (
              <div
                key={movie._id}
                className="flex justify-between p-2 border-b border-gray-700"
              >
                <span>{movie.title}</span>
                <div className="flex gap-2">
                  {sections.map(([key]) => (
                    <button
                      key={key}
                      className="px-2 py-1 bg-blue-600 rounded"
                      onClick={() => add(key, movie)}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {sections.map(([key, label]) => (
          <div key={key} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{label}</h2>

            {config[key].map((movie, i) => (
              <Item
                key={movie._id + key}
                movie={movie}
                index={i}
                section={key}
              />
            ))}
          </div>
        ))}

        <button onClick={save} className="px-5 py-3 bg-green-600 rounded">
          Save Changes
        </button>
      </div>
    </DndProvider>
  );
}
