export default function VideoBox(props: any) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <video
        ref={props.video}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      ></video>
      <audio ref={props.audio} autoPlay></audio>
    </div>
  );
}
