import {useEffect } from 'react'
import { Outlet, useParams } from 'react-router'
import Search from './Search.tsx';

function App() {
  let { id } = useParams();

  useEffect(() => {
    async function doIt() {
      if (id) {
        // const kanji = await db.kanji(parseInt(id));
        // setSelectedKanji(kanji);
      }
    }
    doIt();
  }, [id]);

  return (
    <>
      <Search />
      
      <div className="position-absolute vw-100 vh-100 top-0 start-0 z-0">
        <Outlet />
      </div>
    </>
  )
}

export default App
