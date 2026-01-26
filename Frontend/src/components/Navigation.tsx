import '../Style/Components/Navigation.css'

function Navigation()
{
    return(
        <>
            <div className="Navigation_Bar">
                <div className="Name">
                    <h1>Arduino Web</h1>
                </div>
                <div className="Hyper_Links">
                    <a href="/">Home</a>
                    <a href="/projects">Projects</a>
                    <a href="/about">About</a>
                </div>
                <div className="Profile">
                    <button>Profile</button>
                </div>
            </div>
        </>
    )
}

export default Navigation