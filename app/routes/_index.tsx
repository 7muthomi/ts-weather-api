import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useNavigation,
  useRouteError,
  useSearchParams,
} from "@remix-run/react";
import { ErrorIcon, Search } from "../icons";

export const meta: MetaFunction = () => {
  return [
    { title: "Weather App" },
    { name: "description", content: "Get current weather information!" },
  ];
};

interface WeatherResponse {
  base: string;
  clouds: {
    all: number;
  };
  cod: number;
  coord: {
    lat: number;
    lon: number;
  };
  dt: number;
  id: number;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    sea_level: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  name: string;

  sys: {
    country: string;
    id: number;
    sunrise: number;
    sunset: number;
    type: number;
  };
  timezone: number;
  visibility: number;
  weather: {
    description: string;
    icon: string;
    id: number;
    main: string;
  }[];
  wind: {
    deg: number;
    speed: number;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  // throw new Error();
  let url = new URL(request.url);

  let searchParams = url.searchParams;
  let city = searchParams.get("q") || "Nairobi";

  // if (!city) {
  //   throw new Response("City name not found");
  // }
  let weatherRes = await fetch(
    ` https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric `
  );
  let weather: WeatherResponse = await weatherRes.json();

  return weather;
}
export default function Index() {
  let weather = useLoaderData<typeof loader>();

  let locations = ["Mombasa", "Aswan", "Tokyo"];

  let [searchParams] = useSearchParams();
  let q = searchParams.get("q") || "";

  let navigation = useNavigation();
  console.log({ navigation });

  let isSearching = Boolean(
    navigation.state === "loading" && navigation.location.search
  );

  console.log({ isSearching });
  return (
    <main
      className={`h-screen w-full bg-[url('https://images.unsplash.com/photo-1579003593419-98f949b9398f?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-no-repeat bg-center grid lg:grid-cols-4 relative`}
    >
      {isSearching ? (
        <div className="w-full  h-screen absolute grid place-items-center bg-black/50">
          <img src="/three-dots.svg" alt="" />
        </div>
      ) : null}
      <div className="lg:col-span-3 flex flex-col justify-between p-8 lg:pb-24">
        {/* weather */}

        <h1>weather</h1>
        <div className="flex gap-4 items-center">
          <span className="text-4xl lg:text-5xl font-semibold">
            {weather.main.temp} &deg;
          </span>
          <span className="text-2xl">
            {" "}
            {weather.name}, {weather.sys.country}
          </span>
          <div className="flex items-end ">
            <span>{weather.weather[0].main}</span>
            <img
              src={` https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt=""
              className="w-10 "
            />
          </div>
        </div>
      </div>

      <div className="backdrop-blur lg:col-span-1 px-4 lg:px-5">
        {/* form and details */}
        <Form>
          <input
            type="search"
            name="q"
            placeholder="search location"
            aria-label="search-location"
            defaultValue={q}
            className="bg-transparent border border-gray-300 px-4 py-2"
          />
          <button type="submit" className="bg-orange-500 p-3 text-black">
            <Search />
          </button>
          <div className="mt-8">
            <h2 className="font-semibold"> locations</h2>
          </div>
        </Form>
        <ul className="space-y-2 text-gray-300 mt-4">
          {locations.map((item, index) => (
            <li key={index}>
              <Link to={`/?q=${item}`}>{item}</Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <h2>weather details</h2>
          <ul className="mt-4 text-gray-300">
            {weather.weather.map((item) => (
              <li>{item.main}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    console.error(error);
    return (
      <div className="w-full h-screen grid place-items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-60">
            <ErrorIcon />
          </div>

          <h1 className="text-3xl text-red-500">Error</h1>
          <p className="text-red-300">{error.message}</p>
        </div>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
