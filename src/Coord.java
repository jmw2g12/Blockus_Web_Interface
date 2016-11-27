public class Coord{
	public int x,y;
	public Coord(int x, int y){
		this.x = x;
		this.y = y;
	}
	public Coord(){
		this.x = 0;
		this.y = 0;
	}
	public String to_string(){
		return x + "," + y;
	}
	public Coord clone(){
		Coord result = new Coord(x,y);
		return result;
	}
	@Override
	public boolean equals(Object obj){
		if (obj instanceof Coord && ((Coord)obj).x == x && ((Coord)obj).y == y) return true;
		return false;
	}
}
