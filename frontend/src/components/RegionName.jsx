const RegionName = (props) => {
  const { region, fullX, fullY } = props;

  return (
    <div className="regionName" style={{
      position: "absolute",
      left: `calc(${(region.position[0] / 100) * fullX}px - 80px)`,
      top: `calc(${(region.position[1] / 100) * fullY}px - 30px)`,
    }}>
      <h2>{region.name}</h2>
      <div className={
        `regionTriangle${
        region.arrow[1] == "up" ? " regionTriangleTop" :
        region.arrow[1] == "down" ? " regionTriangleBottom" : ""}`} style={{
          left: `calc(${(region.arrow[0] / 100) * 180}px - 5px)`
        }}/>
    </div>
  );
}

export default RegionName;