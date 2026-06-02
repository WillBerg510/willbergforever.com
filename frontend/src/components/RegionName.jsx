const RegionName = (props) => {
  const { region, enterRegion } = props;

  return (
    <div className="regionName" onClick={() => enterRegion(region)} style={{
      position: "absolute",
      left: `${region.position[0]}%`,
      top: `${region.position[1]}%`,
      '--glide-delay': `${Math.random() * 0.08}s`
    }}>
      <h2>{region.name}</h2>
      <div className={
        `regionTriangle${
        region.arrow[1] == "up" ? " regionTriangleTop" :
        region.arrow[1] == "down" ? " regionTriangleBottom" : ""}`} style={{
          left: `calc(${(region.arrow[0] / 100) * 100}% - 5px)`
        }}/>
    </div>
  );
}

export default RegionName;